import Link from "next/link";

interface NewsItem {
  title: string;
  slug?: string;
}

interface WhatsNewsProps {
  businessNews?: NewsItem[];
  worldNews?: NewsItem[];
}

// Default fallback content
const defaultBusinessNews: NewsItem[] = [
  { title: "U.S. GDP Growth Slowed in First Quarter" },
  { title: "First Republic Bank Seized by Regulators" },
  { title: "Meta Reports Rise in Revenue, Ad Sales" },
  { title: "Microsoft's Activision Deal Blocked by UK" }
];

const defaultWorldNews: NewsItem[] = [
  { title: "Fighting Intensifies in Sudan Capital" },
  { title: "Ukraine Prepares for Spring Counteroffensive" },
  { title: "Turkey's Erdogan Cancels Campaign Events" },
  { title: "South Korea's President Visits White House" }
];

export default function WhatsNews({ businessNews, worldNews }: WhatsNewsProps) {
  const business = businessNews || defaultBusinessNews;
  const world = worldNews || defaultWorldNews;

  return (
    <div className="flex flex-col h-full">
       <h3 className="text-sm font-sans font-bold text-gray-500 uppercase border-t-2 border-black pt-1 mb-4">
         What's News
       </h3>
       
       <div className="flex-1">
          <h4 className="text-xs font-bold text-gray-900 uppercase mb-3 bg-gray-100 p-1">
            Business & Finance
          </h4>
          <ul className="space-y-4 mb-6">
            {business.map((item, i) => (
                <li key={i}>
                  {item.slug ? (
                    <Link 
                      href={`/article/${item.slug}`}
                      className="text-sm font-serif text-gray-800 leading-snug hover:text-blue-700 cursor-pointer border-b border-gray-100 pb-2 block"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <span className="text-sm font-serif text-gray-800 leading-snug hover:text-blue-700 cursor-pointer border-b border-gray-100 pb-2 block">
                      {item.title}
                    </span>
                  )}
                </li>
            ))}
          </ul>

          <h4 className="text-xs font-bold text-gray-900 uppercase mb-3 bg-gray-100 p-1">
            World-Wide
          </h4>
          <ul className="space-y-4">
            {world.map((item, i) => (
                <li key={i}>
                  {item.slug ? (
                    <Link 
                      href={`/article/${item.slug}`}
                      className="text-sm font-serif text-gray-800 leading-snug hover:text-blue-700 cursor-pointer border-b border-gray-100 pb-2 block"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <span className="text-sm font-serif text-gray-800 leading-snug hover:text-blue-700 cursor-pointer border-b border-gray-100 pb-2 block">
                      {item.title}
                    </span>
                  )}
                </li>
            ))}
          </ul>
       </div>
    </div>
  );
}
