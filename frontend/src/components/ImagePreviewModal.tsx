import { Check, X } from "lucide-react";
import clsx from "clsx";
interface GeneratedImage {
    id: string;
    base64?: string;
    url?: string;
    prompt?: string;
    source: "extracted" | "gemini" | "dalle";
    sourceDomain?: string;
}

interface ImagePreviewModalProps {
    showImageModal: boolean;
    setShowImageModal: (show: boolean) => void;
    generatedImages: GeneratedImage[];
    setSelectedImageIndex: (index: number) => void;
    selectedImageIndex: number | null;
    imageCaption: string;
    setImageCaption: (caption: string) => void;
    saveSelectedImage: () => void;
}

type SourceDomainBadgeProps = {
    source: "extracted" | "gemini" | "dalle";
    domain: string;
};
const SourceDomainBadge = ({ source, domain }: SourceDomainBadgeProps) => {
    return (
        <span
            className={clsx("text-[10px] px-2 py-0.5 font-bold", {
                "bg-green-500 text-white": source === "extracted",
                "bg-purple-500 text-white": source === "gemini",
                "bg-blue-500 text-white": source === "dalle",
            })}
        >
            {domain || "Extracted"}
        </span>
    );
};

type ImagePreviewProps = {
    image: GeneratedImage;
    active: boolean;
    setSelectedImage: () => void;
};

const ImagePreview = ({
    image,
    active,
    setSelectedImage,
}: ImagePreviewProps) => {
    return (
        <button
            key={image.id}
            onClick={setSelectedImage}
            className={`relative aspect-video overflow-hidden border-2 ${
                active
                    ? "border-black ring-2 ring-black/20"
                    : "border-gray-200 hover:border-gray-400"
            }`}
        >
            {image.url || image.base64 ? (
                <img
                    src={image.url || `data:image/png;base64,${image.base64}`}
                    alt={`Option ${image.id}`}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-400">No preview</span>
                </div>
            )}
            {active && (
                <div className="absolute top-2 right-2 bg-black text-white rounded-full p-1">
                    <Check className="w-3 h-3" />
                </div>
            )}
            <div className="absolute top-2 left-2">
                <SourceDomainBadge
                    source={image.source}
                    domain={image.sourceDomain || "Extracted"}
                />
            </div>
        </button>
    );
};

export function ImagePreviewModal({
    showImageModal,
    setShowImageModal,
    generatedImages,
    setSelectedImageIndex,
    selectedImageIndex,
    imageCaption,
    setImageCaption,
    saveSelectedImage,
}: ImagePreviewModalProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-serif font-bold">Select Image</h2>
                    <button
                        onClick={() => setShowImageModal(false)}
                        className="p-1 hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {generatedImages.map((img, index) => (
                            <ImagePreview
                                key={img.id}
                                image={img}
                                active={selectedImageIndex === index}
                                setSelectedImage={() => setSelectedImageIndex(index)}
                            />
                        ))}
                    </div>
                </div>

                {/* Caption Input */}
                {selectedImageIndex !== null && (
                    <div className="px-4 py-3 border-t border-gray-200">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                            Image Caption{" "}
                            <span className="text-gray-400 font-normal normal-case">
                                (optional - AI will generate if left blank)
                            </span>
                        </label>
                        <input
                            type="text"
                            value={imageCaption}
                            onChange={(e) => setImageCaption(e.target.value)}
                            placeholder="Leave blank for AI-generated caption, or enter your own..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 focus:border-black focus:outline-none italic"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                            💡 If left empty, AI will generate a news-style
                            caption based on the article context
                        </p>
                    </div>
                )}

                <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
                    <button
                        onClick={() => {
                            setShowImageModal(false);
                            setImageCaption("");
                        }}
                        className="px-4 py-2 text-sm font-bold border border-gray-300 hover:border-black"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={saveSelectedImage}
                        disabled={selectedImageIndex === null}
                        className="px-4 py-2 text-sm font-bold bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        Use Selected
                    </button>
                </div>
            </div>
        </div>
    );
}
