import { Zap } from 'lucide-react'
import { WRITING_STYLES } from '../lib/writing-styles'

interface Section {
  id: string
  label: string
}

interface TopicSelectionModalProps {
  pendingSection: string
  sections: Section[]
  topicInput: string
  setTopicInput: (value: string) => void
  wordCount: string
  writingStyle: string
  onClose: () => void
  onAgentChoosesTopic: () => void
  onGenerateWithTopic: () => void
}

export function TopicSelectionModal({
  pendingSection,
  sections,
  topicInput,
  setTopicInput,
  wordCount,
  writingStyle,
  onClose,
  onAgentChoosesTopic,
  onGenerateWithTopic,
}: TopicSelectionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-lg w-full border border-gray-200 shadow-xl">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-serif text-xl font-bold">
            Generate {sections.find(s => s.id === pendingSection)?.label || pendingSection} Article
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Enter a specific topic or let the agent choose what's trending
          </p>
        </div>
        
        <div className="p-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Topic / Reference (optional)
          </label>
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder="e.g., Trump's latest immigration policy, Fed interest rate decision..."
            className="w-full px-4 py-3 text-sm border border-gray-300 focus:border-black focus:outline-none mb-4"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && topicInput.trim()) {
                onGenerateWithTopic()
              }
            }}
          />
          
          <div className="bg-gray-50 border border-gray-200 p-3 mb-4 text-xs text-gray-600">
            <strong>Current settings:</strong>
            <span className="ml-2">{wordCount} words</span>
            <span className="mx-2">•</span>
            <span>{WRITING_STYLES.find(s => s.id === writingStyle)?.label}</span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-bold border border-gray-300 hover:border-black"
          >
            Cancel
          </button>
          <div className="flex gap-2">
            <button
              onClick={onAgentChoosesTopic}
              className="px-4 py-2 text-sm font-bold border border-gray-300 hover:border-black hover:bg-gray-50"
            >
              <Zap className="w-3 h-3 inline mr-1" />
              Agent Chooses Topic
            </button>
            <button
              onClick={onGenerateWithTopic}
              disabled={!topicInput.trim()}
              className="px-4 py-2 text-sm font-bold bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate with Topic
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

