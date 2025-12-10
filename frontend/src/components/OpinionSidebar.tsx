import { Link } from "react-router-dom";

interface OpinionItem {
  title: string;
  author: string;
  slug?: string;
}

interface OpinionSidebarProps {
  opinions?: OpinionItem[];
  satire?: OpinionItem[];
}

// Default fallback content (8 items)
const defaultOpinions: OpinionItem[] = [
  { title: "The Debt Ceiling Trap", author: "The Editorial Board" },
  { title: "Why AI Will Save the World", author: "Marc Andreessen" },
  { title: "The Case for a 4-Day Work Week", author: "Letters to the Editor" },
  { title: "Xi Jinping's Power Play", author: "Walter Russell Mead" },
  { title: "The Future of American Democracy", author: "Peggy Noonan" },
  { title: "Tech Regulation Gone Wrong", author: "Holman W. Jenkins Jr." },
  { title: "The Fed's Next Move", author: "The Editorial Board" },
  { title: "What Ukraine Needs Now", author: "Gerard Baker" }
];

// Default satire fallback
const defaultSatire: OpinionItem[] = [
  { title: "Area Man Confident He Could Handle Being A Millionaire", author: "The Lighter Side" },
  { title: "Study Finds Working From Home 'Too Convenient'", author: "The Lighter Side" },
];

export default function OpinionSidebar({ opinions, satire }: OpinionSidebarProps) {
  const opinionItems = opinions?.map(op => ({
    title: op.title,
    author: op.author,
    slug: op.slug,
  })) || defaultOpinions;

  const satireItems = satire?.map(s => ({
    title: s.title,
    author: s.author,
    slug: s.slug,
  })) || defaultSatire;

  return (
    <div className="h-full">
      {/* Opinion Section */}
      <h3 className="text-sm font-sans font-bold text-gray-500 uppercase border-t-2 border-black pt-1 mb-4">
        Opinion
      </h3>
      <div className="space-y-6">
        {opinionItems.map((op, i) => (
          <div key={i} className="group cursor-pointer">
            {op.slug ? (
              <Link to={`/article/${op.slug}`}>
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

      {/* Satire Section - Same container, different color */}
      <div className="mt-8 pt-6 border-t border-amber-300">
        <h3 className="text-sm font-sans font-bold text-amber-700 uppercase mb-4 flex items-center gap-2">
          <span>🧅</span> The Lighter Side
          <span className="text-xs font-normal text-amber-500 normal-case">· Satire</span>
        </h3>
        <div className="space-y-5">
          {satireItems.map((item, i) => (
            <div key={i} className="group cursor-pointer">
              {item.slug ? (
                <Link to={`/article/${item.slug}`}>
                  <h4 className="text-base font-serif text-amber-900 leading-tight group-hover:text-amber-600 mb-1">
                    {item.title}
                  </h4>
                </Link>
              ) : (
                <h4 className="text-base font-serif text-amber-900 leading-tight group-hover:text-amber-600 mb-1">
                  {item.title}
                </h4>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
