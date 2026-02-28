create extension if not exists vector;

alter table public.document_chunks
add column if not exists embedding vector(1536);

create index if not exists idx_document_chunks_embedding_ivfflat
on public.document_chunks
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

create or replace function public.search_notice_chunks_hybrid(
  p_notice_id uuid,
  p_query text,
  p_query_embedding vector(1536) default null,
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
      end as ts_query,
      p_query_embedding as query_embedding
  ),
  scored as (
    select
      dc.id as chunk_id,
      dc.document_id,
      d.file_name,
      dc.content,
      case
        when q.ts_query is null then 0::real
        else ts_rank_cd(dc.content_tsv, q.ts_query)::real
      end as fts_rank,
      case
        when q.query_embedding is null or dc.embedding is null then 0::real
        else greatest(0::real, (1 - (dc.embedding <=> q.query_embedding))::real)
      end as vector_rank
    from public.document_chunks dc
    inner join public.documents d on d.id = dc.document_id
    cross join query_data q
    where d.notice_id = p_notice_id
      and (
        q.ts_query is null
        or dc.content_tsv @@ q.ts_query
        or (q.query_embedding is not null and dc.embedding is not null)
      )
  )
  select
    s.chunk_id,
    s.document_id,
    s.file_name,
    s.content,
    (s.fts_rank * 0.45 + s.vector_rank * 0.55)::real as rank
  from scored s
  order by rank desc, s.chunk_id
  limit greatest(1, least(coalesce(p_match_count, 8), 20));
$$;

grant execute on function public.search_notice_chunks_hybrid(uuid, text, vector, int) to authenticated;
