import React from 'react';

interface SmartRendererProps {
  content: string;
}

export const SmartRenderer: React.FC<SmartRendererProps> = ({ content }) => {
  let jsonData = null;
  try {
    // Attempt to find JSON structure even if there is preamble text
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const potentialJson = content.substring(jsonStart, jsonEnd + 1);
      jsonData = JSON.parse(potentialJson);
    }
  } catch (e) {
    // Not valid JSON, treat as text
  }

  // Helper to render Markdown safely
  const renderMarkdown = (text: string) => {
    // @ts-ignore - marked is loaded via CDN
    const html = window.marked ? window.marked.parse(text) : text;
    return <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-300" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (jsonData) {
    // RENDER: LinkedIn Carousel
    if (jsonData.slides && Array.isArray(jsonData.slides)) {
      return (
        <div className="space-y-4">
          <h3 className="text-[#00FF66] text-sm font-mono uppercase tracking-widest">Generated Carousel</h3>
          <div className="flex overflow-x-auto space-x-4 pb-4 snap-x">
            {jsonData.slides.map((slide: any, idx: number) => (
              <div key={idx} className="snap-center shrink-0 w-64 bg-[#18181B] border border-white/5 p-4 rounded-xl shadow-lg flex flex-col">
                <div className="text-xs text-[#00FF66] font-bold mb-2">SLIDE {slide.slide_number}</div>
                <div className="text-white font-semibold mb-2">{slide.headline}</div>
                <div className="text-gray-400 text-xs flex-grow">{slide.body}</div>
                {slide.visual_cue && (
                    <div className="mt-3 p-2 bg-black/40 rounded text-[10px] text-gray-500 font-mono">
                        Visual: {slide.visual_cue}
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // RENDER: Social Distribution Plan
    if (jsonData.channels && Array.isArray(jsonData.channels)) {
        return (
            <div className="space-y-6">
                <h3 className="text-[#00FF66] text-sm font-mono uppercase tracking-widest">Distribution Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {jsonData.channels.map((channel: any, idx: number) => (
                        <div key={idx} className="bg-[#18181B] border border-white/5 p-4 rounded-xl">
                            <div className="text-[#00FF66] font-bold mb-2 border-b border-white/5 pb-1">{channel.name}</div>
                            {channel.posts && channel.posts.map((post: any, pIdx: number) => (
                                <div key={pIdx} className="mb-3 last:mb-0">
                                    <span className="text-xs bg-[#00FF66]/20 text-[#00FF66] px-1 rounded mr-2">{post.type || 'Post'}</span>
                                    <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{post.content}</p>
                                </div>
                            ))}
                            {channel.subject && (
                                <div className="text-sm">
                                    <div className="text-gray-400">Subject: <span className="text-white">{channel.subject}</span></div>
                                    <div className="text-gray-300 mt-2 text-xs">{channel.body}</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // RENDER: Video Storyboard
    if (jsonData.scenes && Array.isArray(jsonData.scenes)) {
        return (
            <div className="space-y-4">
                <h3 className="text-[#00FF66] text-sm font-mono uppercase tracking-widest">Video Storyboard</h3>
                <div className="space-y-2">
                    {jsonData.scenes.map((scene: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-[#00FF66]/50 transition-colors">
                            <div className="w-16 text-xs font-mono text-[#00FF66] pt-1">{scene.time}</div>
                            <div className="flex-1">
                                <div className="text-sm text-white mb-1">🎥 {scene.visual}</div>
                                <div className="text-xs text-gray-400">🎙️ {scene.audio}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // RENDER: Standard JSON dump if specialized view not found
    return (
        <div className="bg-black border border-white/10 p-4 rounded-xl overflow-auto max-h-96">
            <pre className="text-xs text-[#00FF66] font-mono">{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
    );
  }

  // Fallback to Markdown
  return renderMarkdown(content);
};