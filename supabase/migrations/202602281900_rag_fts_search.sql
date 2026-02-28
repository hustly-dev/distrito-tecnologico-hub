alter table public.document_chunks
add column if not exists content_tsv tsvector
generated always as (to_tsvector('portuguese', coalesce(content, ''))) stored;

create index if not exists idx_document_chunks_content_tsv
on public.document_chunks
using gin (content_tsv);

create or replace function public.search_notice_chunks_fts(
  p_notice_id uuid,
  p_query text,
  p_match_count int default 8
)
returns table (
  chunk_id uuid,
  document_id uuid,
  file_name text,
  content text,
  rank real
)
language sql
stable
as $$
  with query_data as (
    select
      case
        when coalesce(trim(p_query), '') = '' then null
        else websearch_to_tsquery('portuguese', p_query)
      end as ts_query
  )
  select
    dc.id as chunk_id,
    dc.document_id,
    d.file_name,
    dc.content,
    case
      when q.ts_query is null then 0::real
      else ts_rank_cd(dc.content_tsv, q.ts_query)::real
    end as rank
  from public.document_chunks dc
  inner join public.documents d on d.id = dc.document_id
  cross join query_data q
  where d.notice_id = p_notice_id
    and (
      q.ts_query is null
      or dc.content_tsv @@ q.ts_query
    )
  order by
    case when q.ts_query is null then dc.created_at end desc,
    rank desc,
    dc.created_at desc
  limit greatest(1, least(coalesce(p_match_count, 8), 20));
$$;

grant execute on function public.search_notice_chunks_fts(uuid, text, int) to authenticated;
