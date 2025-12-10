import { Link } from "react-router-dom";

interface Story {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  image_url?: string;
  image_caption?: string;
  section?: string;
}

interface SecondaryStoriesProps {
  stories: Story[];
}

export default function SecondaryStories({ stories }: SecondaryStoriesProps) {
  if (stories.length === 0) {
    return null;
  }

  // Show up to 6 stories in a 2-column grid (3 rows)
  const displayStories = stories.slice(0, 6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-gray-200 pt-6">
      {displayStories.map((story, index) => (
        <div 
          key={story.id} 
          className={`pb-6 ${index % 2 === 0 ? "md:pr-4 md:border-r border-gray-200" : ""} ${index < displayStories.length - 2 ? "border-b border-gray-100" : ""}`}
        >
          <Link to={`/article/${story.slug}`}>
            {story.image_url && (
              <div className="mb-3 h-40 overflow-hidden rounded">
                <img 
                  src={story.image_url} 
                  alt={story.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            {story.section && (
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {story.section.charAt(0).toUpperCase() + story.section.slice(1)}
              </span>
            )}
            <h3 className="font-serif text-xl font-bold mb-2 hover:underline cursor-pointer">
              {story.title}
            </h3>
            <p className="font-serif text-sm text-gray-600 leading-relaxed line-clamp-3">
              {story.excerpt}
            </p>
          </Link>
        </div>
      ))}
    </div>
  );
}

