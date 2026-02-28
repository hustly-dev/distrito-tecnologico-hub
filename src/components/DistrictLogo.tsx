import Link from "next/link";
import Image from "next/image";

interface DistrictLogoProps {
  href?: string;
}

export function DistrictLogo({ href = "/hub" }: DistrictLogoProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center"
      aria-label="Ir para o hub do Distrito Tecnologico"
    >
      <Image
        src="/logo-distrito.png"
        alt="Logo do Distrito Tecnologico"
        width={178}
        height={52}
        priority
        className="h-auto w-[118px] object-contain sm:w-[168px]"
      />
    </Link>
  );
}
