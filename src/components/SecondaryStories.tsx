import Link from "next/link";

interface Story {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  imageUrl?: string;
}

interface SecondaryStoriesProps {
  stories: Story[];
}

export default function SecondaryStories({ stories }: SecondaryStoriesProps) {
  if (stories.length === 0) {
    return null;
  }

  // Show up to 4 stories in a 2x2 grid
  const displayStories = stories.slice(0, 4);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 border-t border-gray-200 pt-6">
      {displayStories.map((story, index) => (
        <div 
          key={story.id} 
          className={index % 2 === 0 ? "md:pr-4 md:border-r border-gray-200" : ""}
        >
          <Link href={`/article/${story.slug}`}>
            {story.imageUrl && (
              <div className="mb-3 h-40 overflow-hidden rounded">
                <img 
                  src={story.imageUrl} 
                  alt={story.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <h3 className="font-serif text-xl font-bold mb-2 hover:underline cursor-pointer">
              {story.title}
            </h3>
            <p className="font-serif text-sm text-gray-600 leading-relaxed">
              {story.excerpt}
            </p>
          </Link>
        </div>
      ))}
    </div>
  );
}

