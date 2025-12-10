import { Link } from "react-router-dom";

interface LeadStoryProps {
  category: string;
  headline: string;
  summary: string;
  author: string;
  readTime: string;
  imageUrl?: string;
  imageCaption?: string;
  slug?: string;
}

export default function LeadStory({ category, headline, summary, author, readTime, imageUrl, imageCaption, slug }: LeadStoryProps) {
  const content = (
    <div className="flex flex-col border-b border-gray-300 pb-6 mb-6">
      <div className="order-2 md:order-1">
        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          {category}
        </span>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 leading-tight mb-3 hover:underline cursor-pointer">
          {headline}
        </h2>
        <p className="text-lg font-serif text-gray-700 leading-relaxed mb-4">
          {summary}
        </p>
        <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider space-x-2">
            <span>{author}</span>
            <span className="text-gray-300">|</span>
            <span>{readTime}</span>
        </div>
      </div>
       {/* Article Image */}
       <figure className="order-1 md:order-2 mb-4 md:mb-6">
          <div className="relative h-64 md:h-96 w-full overflow-hidden rounded">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={headline}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 italic">Article Image</span>
              </div>
            )}
          </div>
          {imageCaption && (
            <figcaption className="mt-2 text-sm text-gray-600 italic">
              {imageCaption}
            </figcaption>
          )}
       </figure>
    </div>
  );

  if (slug) {
    return (
      <Link to={`/article/${slug}`}>
        {content}
      </Link>
    );
  }

  return content;
}

