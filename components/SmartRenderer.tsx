import React from 'react';

interface SmartRendererProps {
  content: string;
}

export const SmartRenderer: React.FC<SmartRendererProps> = ({ content }) => {
  
  // RENDER: Image (Base64)
  if (content.startsWith('data:image')) {
      return (
          <div className="flex flex-col items-center justify-center p-4 bg-[#121212] border-2 border-[#333333]">
              <img src={content} alt="Generated Asset" className="max-w-full h-auto border-2 border-white pump-shadow-white-sm" />
              <div className="mt-6 flex gap-4">
                <a href={content} download="pump_generated_image.png" className="px-4 py-2 bg-[#00FF66] text-black font-condensed font-black uppercase text-lg hover:bg-white transition-colors border-2 border-black">
                    Download Image
                </a>
              </div>
          </div>
      )
  }

  // RENDER: Audio (Base64)
  if (content.startsWith('data:audio')) {
      return (
          <div className="p-6 bg-[#121212] border-2 border-[#333333]">
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-[#00FF66] flex items-center justify-center border-2 border-white">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                  </div>
                  <div className="text-xl font-condensed font-black text-white uppercase">Generated Voiceover</div>
              </div>
              <audio controls src={content} className="w-full mb-4" />
              <a href={content} download="pump_generated_audio.wav" className="inline-block px-4 py-2 text-xs font-bold text-[#00FF66] border border-[#00FF66] hover:bg-[#00FF66] hover:text-black uppercase tracking-widest transition-colors">
                    Download .WAV
              </a>
          </div>
      )
  }

  let jsonData = null;
  try {
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const potentialJson = content.substring(jsonStart, jsonEnd + 1);
      jsonData = JSON.parse(potentialJson);
    }
  } catch (e) {
    // Not valid JSON
  }

  const renderMarkdown = (text: string) => {
    // @ts-ignore
    const html = window.marked ? window.marked.parse(text) : text;
    return <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-300 font-medium" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (jsonData) {
    // RENDER: LinkedIn Carousel
    if (jsonData.slides && Array.isArray(jsonData.slides)) {
      return (
        <div className="space-y-6">
          <h3 className="text-[#00FF66] font-condensed font-black text-2xl uppercase">Generated Carousel</h3>
          <div className="flex overflow-x-auto space-x-6 pb-6 snap-x">
            {jsonData.slides.map((slide: any, idx: number) => (
              <div key={idx} className="snap-center shrink-0 w-72 bg-[#121212] border-2 border-[#333333] p-6 flex flex-col pump-shadow-sm">
                <div className="text-sm text-[#00FF66] font-mono font-bold mb-3 border-b border-[#333333] pb-2">SLIDE {slide.slide || slide.slide_number || idx + 1}</div>
                <div className="text-white font-condensed font-bold text-2xl mb-3 uppercase leading-none">{slide.headline}</div>
                <div className="text-gray-400 text-xs flex-grow font-mono leading-relaxed mb-4">{slide.body}</div>
                {slide.visual_cue && (
                    <div className="mt-auto p-3 bg-black border border-[#333333] text-[10px] text-gray-500 font-mono">
                        <span className="text-[#00FF66] font-bold">VISUAL:</span> {slide.visual_cue}
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
            <div className="space-y-8">
                <h3 className="text-[#00FF66] font-condensed font-black text-2xl uppercase">Distribution Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jsonData.channels.map((channel: any, idx: number) => (
                        <div key={idx} className="bg-[#121212] border-2 border-[#333333] p-6">
                            <div className="text-white font-condensed font-black text-xl mb-4 border-b-2 border-[#00FF66] pb-2 uppercase">{channel.name}</div>
                            {channel.posts && channel.posts.map((post: any, pIdx: number) => (
                                <div key={pIdx} className="mb-4 last:mb-0">
                                    <span className="inline-block text-[10px] bg-[#00FF66] text-black px-2 py-0.5 font-bold uppercase mb-2">{post.type || 'Post'}</span>
                                    <p className="text-sm text-gray-300 font-mono whitespace-pre-wrap border-l-2 border-[#333333] pl-3">{post.content}</p>
                                </div>
                            ))}
                            {channel.subject && (
                                <div className="text-sm">
                                    <div className="text-gray-400 font-mono text-xs mb-1">SUBJECT LINE</div>
                                    <div className="text-white font-bold mb-3">{channel.subject}</div>
                                    <div className="text-gray-300 text-xs font-mono border-l-2 border-[#333333] pl-3">{channel.body}</div>
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
            <div className="space-y-6">
                <h3 className="text-[#00FF66] font-condensed font-black text-2xl uppercase">Video Storyboard</h3>
                <div className="space-y-4">
                    {jsonData.scenes.map((scene: any, idx: number) => (
                        <div key={idx} className="flex gap-6 p-4 bg-[#121212] border-2 border-[#333333] hover:border-[#00FF66] transition-colors">
                            <div className="w-16 text-sm font-mono font-bold text-[#00FF66] pt-1 border-r border-[#333333] pr-4 flex items-center">{scene.time}</div>
                            <div className="flex-1 space-y-2">
                                <div className="text-sm text-white font-bold uppercase flex items-center gap-2">
                                    <span className="text-gray-500">VISUAL</span>
                                    {scene.visual}
                                </div>
                                <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                                    <span className="text-[#00FF66]">AUDIO</span>
                                    {scene.audio}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    
    // RENDER: Polls
    if (jsonData.polls && Array.isArray(jsonData.polls)) {
        return (
            <div className="space-y-6">
                <h3 className="text-[#00FF66] font-condensed font-black text-2xl uppercase">Suggested Polls</h3>
                <div className="space-y-6">
                    {jsonData.polls.map((poll: any, idx: number) => (
                        <div key={idx} className="bg-[#121212] border-2 border-[#333333] p-6 pump-shadow-sm">
                             <div className="flex justify-between items-start mb-4">
                                <span className="text-white font-condensed font-bold text-xl uppercase">{poll.question}</span>
                                <span className="text-[10px] text-black bg-[#00FF66] px-2 py-1 font-bold uppercase">{poll.psychology}</span>
                             </div>
                             <div className="space-y-2">
                                {poll.options?.map((opt: string, oid: number) => (
                                    <div key={oid} className="w-full bg-black p-3 text-sm text-gray-300 border border-[#333333] font-mono hover:border-white transition-colors cursor-default">
                                        [ ] {opt}
                                    </div>
                                ))}
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-black border-2 border-[#333333] p-4 overflow-auto max-h-96">
            <pre className="text-xs text-[#00FF66] font-mono">{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
    );
  }

  return renderMarkdown(content);
};