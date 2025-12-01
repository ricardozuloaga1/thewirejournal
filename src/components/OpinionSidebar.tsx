import Link from "next/link";

interface OpinionItem {
  title: string;
  author: string;
  slug?: string;
}

interface OpinionSidebarProps {
  opinions?: OpinionItem[];
}

// Default fallback content
const defaultOpinions: OpinionItem[] = [
  { title: "The Debt Ceiling Trap", author: "The Editorial Board" },
  { title: "Why AI Will Save the World", author: "Marc Andreessen" },
  { title: "The Case for a 4-Day Work Week", author: "Letters to the Editor" },
  { title: "Xi Jinping's Power Play", author: "Walter Russell Mead" }
];

export default function OpinionSidebar({ opinions }: OpinionSidebarProps) {
  const items = opinions?.map(op => ({
    title: op.title,
    author: op.author,
    slug: op.slug,
  })) || defaultOpinions;

  return (
    <div className="h-full">
      <h3 className="text-sm font-sans font-bold text-gray-500 uppercase border-t-2 border-black pt-1 mb-4">
        Opinion
      </h3>
      <div className="space-y-6">
        {items.map((op, i) => (
          <div key={i} className="group cursor-pointer">
            {op.slug ? (
              <Link href={`/article/${op.slug}`}>
                <h4 className="text-lg font-serif italic text-gray-900 leading-tight group-hover:text-blue-700 mb-1">
                  {op.title}
                </h4>
                <span className="text-xs font-bold text-gray-500 uppercase">
                  {op.author}
                </span>
              </Link>
            ) : (
              <>
                <h4 className="text-lg font-serif italic text-gray-900 leading-tight group-hover:text-blue-700 mb-1">
                  {op.title}
                </h4>
                <span className="text-xs font-bold text-gray-500 uppercase">
                  {op.author}
                </span>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
