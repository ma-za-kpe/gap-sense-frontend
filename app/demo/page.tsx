'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardTitle, CardBody, Badge, Input } from '@/components/ui';
import { sendMessage, uploadImage } from '@/lib/api';

interface ChatMessage {
  id: string;
  type: 'received' | 'sent';
  text: string;
  timestamp: string;
}

export default function Home() {
  const router = useRouter();
  const [teacherPhone, setTeacherPhone] = useState('+233501234567');
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'received',
      text: '👋 Welcome to GapSense! I\'m your AI teaching assistant. Upload a student\'s exercise book photo and I\'ll analyze their math gaps in 8 seconds.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const TOTAL_SLIDES = 12;

  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'sent',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setMessage('');
    setSending(true);

    try {
      const result = await sendMessage({
        message: message,
        teacher_phone: teacherPhone,
      });

      if (result.success && result.data?.response) {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'received',
          text: result.data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory((prev) => [...prev, botResponse]);
      } else {
        const errorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'received',
          text: '❌ Error: ' + (result.error || 'Failed to send message'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory((prev) => [...prev, errorResponse]);
      }
    } catch (error) {
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'received',
        text: '❌ Error: Failed to send message',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, errorResponse]);
    } finally {
      setSending(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || sending) return;

    const uploadMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'sent',
      text: `📷 Uploaded image: ${file.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, uploadMessage]);
    setSending(true);

    const processingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'received',
      text: '🔄 Processing your image... Analyzing student work with AI...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatHistory((prev) => [...prev, processingMessage]);

    try {
      const result = await uploadImage({
        image: file,
        teacher_phone: teacherPhone,
      });

      // Remove processing message
      setChatHistory((prev) => prev.filter((msg) => msg.id !== processingMessage.id));

      if (result.success && result.data?.response) {
        const botResponse: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'received',
          text: result.data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory((prev) => [...prev, botResponse]);
      } else {
        const errorResponse: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'received',
          text: '❌ Error: ' + (result.error || 'Failed to process image'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory((prev) => [...prev, errorResponse]);
      }
    } catch (error) {
      setChatHistory((prev) => prev.filter((msg) => msg.id !== processingMessage.id));
      const errorResponse: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'received',
        text: '❌ Error: Failed to process image',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatHistory((prev) => [...prev, errorResponse]);
    } finally {
      setSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Slideshow functions
  const changeSlide = (direction: number) => {
    let newSlide = currentSlide + direction;
    if (newSlide < 0) newSlide = TOTAL_SLIDES - 1;
    if (newSlide >= TOTAL_SLIDES) newSlide = 0;
    setCurrentSlide(newSlide);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        changeSlide(1); // Swipe left
      } else {
        changeSlide(-1); // Swipe right
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') changeSlide(-1);
      if (e.key === 'ArrowRight') changeSlide(1);
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  // Slide content components
  const slides = [
    // Slide 1: Cover
    <div key={0} className="flex flex-col items-center justify-center text-center h-full px-4">
      <h1 className="text-3xl sm:text-4xl lg:text-[56px] font-bold text-whatsapp-500 mb-2 sm:mb-4">GapSense</h1>
      <p className="text-base sm:text-xl lg:text-2xl text-gold-500 font-semibold mb-4 sm:mb-8">AI-Powered Learning Gap Diagnostics for Ghana</p>
      <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-[500px] px-4">Empowering teachers to identify and close foundational math gaps through WhatsApp</p>
      <div className="mt-6 sm:mt-12 p-3 sm:p-4 bg-whatsapp-50 rounded-xl max-w-[400px]">
        <p className="text-sm sm:text-base font-semibold text-whatsapp-600 mb-1">UNICEF StartUp Lab Cohort 6</p>
        <p className="text-xs sm:text-sm text-slate-500">Application • March 2026</p>
      </div>
    </div>,

    // Slide 2: The Crisis
    <div key={1} className="flex flex-col items-center justify-center text-center h-full px-4">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-3 sm:mb-6">Ghana's Hidden Learning Crisis</h2>
      <div className="text-5xl sm:text-7xl lg:text-[96px] font-bold text-gold-500 mb-1 sm:mb-2">84%</div>
      <p className="text-sm sm:text-base lg:text-lg text-slate-700 mb-1 sm:mb-2">Of children aged 7-14 lack foundational numeracy</p>
      <p className="text-xs sm:text-sm text-slate-400 italic mb-4 sm:mb-8">UNICEF MICS 2023</p>

      <div className="flex gap-4 sm:gap-8 mb-4 sm:mb-8">
        <div>
          <p className="text-lg sm:text-2xl font-bold text-whatsapp-500 bg-whatsapp-50 px-3 sm:px-4 py-1 sm:py-2 rounded-lg">&lt;25%</p>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">Primary 4 at math level</p>
        </div>
        <div>
          <p className="text-lg sm:text-2xl font-bold text-whatsapp-500 bg-whatsapp-50 px-3 sm:px-4 py-1 sm:py-2 rounded-lg">55%</p>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">Have misconceptions</p>
        </div>
      </div>

      <div className="bg-gold-50 p-4 sm:p-6 rounded-xl border-l-4 border-gold-500 max-w-[550px]">
        <p className="text-sm sm:text-lg lg:text-xl italic text-slate-700">"Teachers know students are struggling, but can't pinpoint which foundational skills are missing."</p>
      </div>
    </div>,

    // Slide 3: Root Problem
    <div key={2} className="flex flex-col items-center justify-center h-full px-4 sm:px-8">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 sm:mb-8 text-center">Why Current Solutions Fail</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 max-w-4xl w-full">
        <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border-l-4 border-red-500">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-2 sm:mb-3">❌ No Diagnostic Tools</h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-1 sm:mb-2">• No way to assess foundational gaps</p>
          <p className="text-xs sm:text-sm text-slate-600">• Paper tests take weeks to analyze</p>
        </div>
        <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border-l-4 border-red-500">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-2 sm:mb-3">❌ No Teacher Support</h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-1 sm:mb-2">• 120K+ teachers lack training</p>
          <p className="text-xs sm:text-sm text-slate-600">• Class sizes of 40+ students</p>
        </div>
        <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border-l-4 border-red-500">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-2 sm:mb-3">❌ No Parent Involvement</h3>
          <p className="text-xs sm:text-sm text-slate-600 mb-1 sm:mb-2">• Parents don't know child's gaps</p>
          <p className="text-xs sm:text-sm text-slate-600">• Language barriers to resources</p>
        </div>
      </div>
    </div>,

    // Slide 4: Solution
    <div key={3} className="flex flex-col items-center justify-center text-center h-full px-4">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-2 sm:mb-4">The GapSense Solution</h2>
      <p className="text-sm sm:text-base lg:text-lg text-slate-600 mb-4 sm:mb-8">AI-Powered Gap Diagnostics via WhatsApp</p>
      <div className="flex flex-col sm:flex-row items-center justify-around max-w-3xl mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="text-center">
          <p className="text-3xl sm:text-5xl mb-2">📸</p>
          <p className="text-xs sm:text-sm font-semibold text-slate-700">Teacher Uploads</p>
          <p className="text-[10px] sm:text-xs text-slate-500">Exercise book photo</p>
          <p className="text-[10px] sm:text-xs text-gold-500 font-semibold">30 seconds</p>
        </div>
        <p className="text-2xl sm:text-4xl text-whatsapp-500 hidden sm:block">→</p>
        <p className="text-2xl text-whatsapp-500 sm:hidden rotate-90">→</p>
        <div className="text-center">
          <p className="text-3xl sm:text-5xl mb-2">🤖</p>
          <p className="text-xs sm:text-sm font-semibold text-slate-700">AI Analyzes</p>
          <p className="text-[10px] sm:text-xs text-slate-500">Ghana curriculum</p>
          <p className="text-[10px] sm:text-xs text-gold-500 font-semibold">8 seconds</p>
        </div>
        <p className="text-2xl sm:text-4xl text-whatsapp-500 hidden sm:block">→</p>
        <p className="text-2xl text-whatsapp-500 sm:hidden rotate-90">→</p>
        <div className="text-center">
          <p className="text-3xl sm:text-5xl mb-2">📊</p>
          <p className="text-xs sm:text-sm font-semibold text-slate-700">Report Generated</p>
          <p className="text-[10px] sm:text-xs text-slate-500">Gap profile</p>
          <p className="text-[10px] sm:text-xs text-gold-500 font-semibold">Instant</p>
        </div>
      </div>
      <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 px-2">✅ No app download  |  ✅ Works offline  |  ✅ Local languages  |  ✅ Free for public schools</p>
    </div>,

    // Slide 5: Live Demo
    <div key={4} className="flex flex-col items-center justify-center h-full px-8">
      <h2 className="text-4xl font-bold text-slate-800 mb-6 text-center">Real Production Results</h2>
      <div className="max-w-[580px] text-left">
        <h3 className="text-lg font-semibold text-slate-700 mb-3">📸 Teacher Uploads Photo</h3>
        <div className="bg-slate-50 p-4 rounded-lg mb-6 border-l-4 border-whatsapp-500">
          <p className="text-base">WhatsApp: "Here's Kofi's work on simultaneous equations"</p>
        </div>

        <div className="flex gap-8 mb-6">
          <div className="flex-1 text-center bg-whatsapp-50 p-4 rounded-lg">
            <div className="text-5xl font-bold text-whatsapp-500">7.97s</div>
            <p className="text-sm text-slate-600 mt-2">Analysis time</p>
          </div>
          <div className="flex-1 text-center bg-gold-50 p-4 rounded-lg">
            <div className="text-5xl font-bold text-gold-500">$0.006</div>
            <p className="text-sm text-slate-600 mt-2">Cost per image</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-700 mb-3">✅ 4 Knowledge Gaps Found</h3>
        <div className="bg-gold-50 p-4 rounded-lg border-l-4 border-gold-500">
          <p className="text-base font-semibold mb-2">• Simultaneous equations (solving systems)</p>
          <p className="text-base font-semibold mb-2">• Linear equations (prerequisite skill)</p>
          <p className="text-base font-semibold mb-2">• Fraction operations (foundational)</p>
          <p className="text-base font-semibold">• Arithmetic patterns (number sense)</p>
        </div>
      </div>
      <p className="text-sm text-slate-400 italic mt-6">Live production system • Deployed March 15, 2026</p>
    </div>,

    // Slide 6: How It Works
    <div key={5} className="flex flex-col items-center justify-center h-full">
      <h2 className="text-4xl font-bold text-slate-800 mb-6 text-center">Curriculum-Aligned AI Engine</h2>
      <div className="max-w-[500px] text-left space-y-2">
        <p className="text-sm">📱 <strong>WhatsApp API</strong> → Teacher uploads photo</p>
        <p className="text-sm">☁️ <strong>AWS S3</strong> → Secure cloud storage</p>
        <p className="text-sm">🤖 <strong>Claude AI (Haiku 4.5)</strong> → Analyzes against 27 curriculum nodes</p>
        <p className="text-xs ml-8 text-slate-600">• Identifies misconceptions</p>
        <p className="text-xs ml-8 text-slate-600">• Traces prerequisite gaps</p>
        <p className="text-xs ml-8 text-slate-600 mb-2">• Detects error patterns</p>
        <p className="text-sm">💾 <strong>PostgreSQL Database</strong> → Historical tracking</p>
        <p className="text-sm">📊 <strong>Teacher Dashboard</strong> → WhatsApp report + web view</p>
      </div>
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600">✅ 27 curriculum nodes mapped (Ghana Primary Math)</p>
        <p className="text-sm text-slate-600">✅ Multi-country ready (Uganda, Kenya, Nigeria)</p>
        <p className="text-sm text-slate-600">✅ Production deployed (AWS ECS + RDS + Load Balancer)</p>
      </div>
    </div>,

    // Slide 7: Market Opportunity
    <div key={6} className="flex flex-col items-center justify-center text-center h-full">
      <h2 className="text-4xl font-bold text-slate-800 mb-4">Market Opportunity</h2>
      <div className="text-[96px] font-bold text-whatsapp-500 mb-2">4.2M</div>
      <p className="text-lg text-slate-700 mb-8">Primary students in Ghana</p>

      <div className="flex gap-6 mb-8">
        <div>
          <p className="text-2xl font-bold text-whatsapp-500 bg-whatsapp-50 px-6 py-2 rounded-lg">120K+</p>
          <p className="text-sm text-slate-600 mt-2">Teachers</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-whatsapp-500 bg-whatsapp-50 px-6 py-2 rounded-lg">32,000</p>
          <p className="text-sm text-slate-600 mt-2">Schools</p>
        </div>
      </div>

      <div className="bg-whatsapp-50 p-6 rounded-xl max-w-[500px] mb-6">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Regional Expansion (12 months)</h3>
        <div className="grid grid-cols-2 gap-4 text-base">
          <div>✅ Uganda: <strong>8.5M</strong></div>
          <div>✅ Kenya: <strong>10.1M</strong></div>
          <div className="col-span-2">✅ Nigeria: <strong>27.5M</strong></div>
        </div>
      </div>

      <div className="text-[56px] font-bold text-gold-500 mb-2">50M+</div>
      <p className="text-lg font-semibold text-slate-700">students across 4 countries</p>
    </div>,

    // Slide 8: Business Model
    <div key={7} className="flex flex-col items-center justify-center h-full px-4 sm:px-8">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-4 sm:mb-8 text-center">Sustainable Impact at Scale</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 max-w-4xl mb-4 sm:mb-6 w-full">
        <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border-l-4 border-whatsapp-500 text-center">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-2">🏫 Public Schools</h3>
          <div className="text-xl sm:text-2xl font-bold text-whatsapp-500 my-2 sm:my-3">FREE</div>
          <p className="text-xs sm:text-sm text-slate-600 mb-1 sm:mb-2">• Government/UNICEF partnerships</p>
          <p className="text-xs sm:text-sm text-slate-600">• 100% coverage goal</p>
        </div>
        <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border-l-4 border-gold-500 text-center">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-2">🎓 Private Schools</h3>
          <div className="text-xl sm:text-2xl font-bold text-gold-500 my-2 sm:my-3">$2/year</div>
          <p className="text-xs sm:text-sm text-slate-600 mb-1 sm:mb-2">• Full analytics dashboard</p>
          <p className="text-xs sm:text-sm text-slate-600">• $1.6M revenue potential</p>
        </div>
        <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border-l-4 border-gold-500 text-center">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-800 mb-2">🤝 B2B Licensing</h3>
          <div className="text-xl sm:text-2xl font-bold text-gold-500 my-2 sm:my-3">$50-200K</div>
          <p className="text-xs sm:text-sm text-slate-600 mb-1 sm:mb-2">• EdTech platforms</p>
          <p className="text-xs sm:text-sm text-slate-600">• NGO programs</p>
        </div>
      </div>
      <div className="bg-gold-50 p-4 sm:p-5 rounded-xl max-w-[600px] border-l-4 border-gold-500 w-full">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-2 sm:mb-3">Unit Economics</h3>
        <p className="text-sm sm:text-base text-slate-700 mb-1 sm:mb-2">Cost per analysis: <strong>$0.006</strong> • Margin: <strong>99.7%</strong></p>
        <p className="text-sm sm:text-base text-slate-700">Path to profitability: <strong>25,000</strong> paid students</p>
      </div>
    </div>,

    // Slide 9: Competitive Landscape
    <div key={8} className="flex flex-col items-center justify-center h-full px-8">
      <h2 className="text-4xl font-bold text-slate-800 mb-6 text-center">Why GapSense Wins</h2>
      <div className="max-w-[550px] text-left">
        <p className="font-semibold text-slate-700 mb-4">Existing solutions don't work for Ghana:</p>
        <p className="text-sm text-slate-600 mb-2">❌ <strong>Paper Tests:</strong> 5+ hours to grade, no gap tracing</p>
        <p className="text-sm text-slate-600 mb-2">❌ <strong>Eneza Education:</strong> SMS-only, quiz-based, not diagnostic</p>
        <p className="text-sm text-slate-600 mb-2">❌ <strong>Khan Academy:</strong> Internet needed, US curriculum, English-only</p>
        <p className="text-sm text-slate-600 mb-6">❌ <strong>Other EdTech:</strong> Not Ghana-aligned, no WhatsApp integration</p>

        <p className="font-semibold text-gold-500 mb-3">Our Competitive Moat:</p>
        <p className="text-sm text-slate-600 ml-5 mb-2">✅ Ghana curriculum prerequisite graph (27 nodes, 47 dependencies)</p>
        <p className="text-sm text-slate-600 ml-5 mb-2">✅ Image-based diagnosis (no typing required)</p>
        <p className="text-sm text-slate-600 ml-5 mb-2">✅ WhatsApp integration (98% penetration in Ghana)</p>
        <p className="text-sm text-slate-600 ml-5">✅ Multi-country adaptability (4 curricula mapped)</p>
      </div>
    </div>,

    // Slide 10: Traction
    <div key={9} className="flex flex-col items-center justify-center h-full px-8">
      <h2 className="text-4xl font-bold text-slate-800 mb-6 text-center">Production System LIVE ✨</h2>
      <div className="max-w-[560px] space-y-4">
        <div className="bg-whatsapp-50 p-6 rounded-xl border-l-4 border-whatsapp-500">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">✅ Cloud Infrastructure</h3>
          <p className="text-base text-slate-700">Enterprise-grade cloud platform • Auto-scaling • Load balanced</p>
        </div>

        <div className="bg-whatsapp-50 p-6 rounded-xl border-l-4 border-whatsapp-500">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">✅ AI Engine Validated</h3>
          <p className="text-base text-slate-700 mb-2"><strong>7.97s</strong> analysis • <strong>$0.006</strong> per image</p>
          <p className="text-base text-slate-700">27 Ghana curriculum topics mapped</p>
        </div>

        <div className="bg-whatsapp-50 p-6 rounded-xl border-l-4 border-whatsapp-500">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">✅ Teacher-Ready Platform</h3>
          <p className="text-base text-slate-700">WhatsApp integration • Web dashboard • Instant reports</p>
        </div>

        <div className="bg-gold-50 p-6 rounded-xl border-l-4 border-gold-500">
          <h3 className="text-xl font-semibold text-gold-500 mb-4">🎯 Next 30 Days</h3>
          <p className="text-base text-slate-700 mb-2">• Pilot with <strong>5 Accra schools</strong> (100 students)</p>
          <p className="text-base text-slate-700 mb-2">• Teacher feedback & iteration</p>
          <p className="text-base text-slate-700">• Validate <strong>85%+</strong> accuracy target</p>
        </div>
      </div>
    </div>,

    // Slide 11: Team
    <div key={10} className="flex flex-col items-center justify-center h-full">
      <h2 className="text-4xl font-bold text-slate-800 mb-8 text-center">Built by Educators & Engineers</h2>
      <div className="max-w-[500px] text-left">
        <p className="text-lg font-semibold text-whatsapp-500 mb-4">Founder</p>
        <p className="ml-5 mb-6 text-sm">
          <strong>[Your Name]</strong> - Founder & CEO<br />
          <span className="text-slate-600">
            Background in education & technology<br />
            Committed to evidence-based design<br />
            Located in Ghana
          </span>
        </p>

        <p className="text-lg font-semibold text-whatsapp-500 mb-4 mt-8">Why Us?</p>
        <div className="ml-5 text-sm text-slate-600 space-y-1">
          <p>✅ Deep understanding of Ghana's education system</p>
          <p>✅ Technical expertise in AI/cloud infrastructure</p>
          <p>✅ Market proximity & cultural context</p>
          <p>✅ Evidence-based product development</p>
        </div>
      </div>
    </div>,

    // Slide 12: The Ask
    <div key={11} className="flex flex-col items-center justify-center text-center h-full px-8">
      <h2 className="text-4xl font-bold text-slate-800 mb-6">Partner With Us</h2>

      <div className="bg-gradient-to-br from-whatsapp-50 to-gold-50 p-8 rounded-2xl mb-8 max-w-[520px] border-2 border-whatsapp-200">
        <p className="text-3xl font-semibold italic text-slate-800">"Every Ghanaian child masters foundational math by age 10"</p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-[600px] mb-6">
        <div className="bg-whatsapp-50 p-5 rounded-xl text-left">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">What We Need</h3>
          <p className="text-base text-slate-700 mb-2">💰 <strong>$5K</strong> UNICEF grant</p>
          <p className="text-base text-slate-700 mb-2">📈 <strong>$15K</strong> scale-up (top 3)</p>
          <p className="text-base text-slate-700">🏫 <strong>25 schools</strong> pilot access</p>
        </div>
        <div className="bg-gold-50 p-5 rounded-xl text-left">
          <h3 className="text-lg font-semibold text-slate-800 mb-3">12-Month Impact</h3>
          <p className="text-base text-slate-700 mb-2">📊 <strong>25 schools</strong> in 5 regions</p>
          <p className="text-base text-slate-700 mb-2">👨‍🏫 <strong>500 teachers</strong> trained</p>
          <p className="text-base text-slate-700">👧 <strong>5,000 students</strong> helped</p>
        </div>
      </div>

      <div className="text-[56px] font-bold text-gold-500 mb-2">85%+</div>
      <p className="text-lg font-semibold text-slate-700">Target accuracy • Multi-country launch</p>
    </div>,
  ];

  return (
    <div className="min-h-screen p-2 sm:p-5">
      {/* Main Container */}
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-5 max-w-[1400px] lg:h-[calc(100vh-40px)] mx-auto">

        {/* Phone Mockup (Left Column) */}
        <div className="w-full lg:w-[420px] lg:min-w-[380px] h-[600px] lg:h-auto bg-white rounded-[15px] lg:rounded-[20px] shadow-container flex flex-col overflow-hidden">
          {/* Phone Header */}
          <div className="bg-gradient-whatsapp text-white p-3 sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <h1 className="text-lg sm:text-2xl font-bold">GapSense Demo</h1>
              <Badge variant="whatsapp" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                LIVE
              </Badge>
            </div>
            <p className="text-xs sm:text-sm opacity-90">
              WhatsApp-based AI Learning Gap Diagnostics
            </p>
          </div>

          {/* Phone Number Input */}
          <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200">
            <label className="block text-xs sm:text-sm text-slate-600 mb-2">
              Teacher Phone Number
            </label>
            <Input
              type="tel"
              value={teacherPhone}
              onChange={(e) => setTeacherPhone(e.target.value)}
              placeholder="+233501234567"
              rounded
            />
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-chat-background p-3 sm:p-4 overflow-y-auto">
            <div className="space-y-3">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={msg.type === 'sent' ? 'flex justify-end' : 'flex'}>
                  <div
                    className={`rounded-lg p-3 shadow-sm max-w-[70%] ${
                      msg.type === 'sent' ? 'bg-chat-sent' : 'bg-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <span className="text-xs text-slate-500 mt-1 block">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-whatsapp-500"></div>
                      <p className="text-sm text-slate-600">Typing...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
            <div className="flex gap-2 mb-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={sending}
                className="px-3 sm:px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-xs sm:text-sm font-semibold disabled:opacity-50"
              >
                📎 Upload
              </button>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={sending}
                rounded
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                className="w-12 h-12 rounded-full bg-whatsapp-500 text-white flex items-center justify-center hover:bg-whatsapp-700 transition-colors disabled:opacity-50"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        {/* Slideshow Container (Right Column) */}
        <div className="flex-1 bg-white rounded-[15px] lg:rounded-[20px] shadow-container flex flex-col overflow-hidden relative">
          {/* Slideshow Header */}
          <div className="p-3 sm:p-5 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-base sm:text-xl font-semibold text-whatsapp-500">How GapSense Works</h2>
            <button
              onClick={() => setIsFullscreen(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 hover:bg-slate-100 text-whatsapp-500 flex items-center justify-center text-xl sm:text-2xl transition-colors"
              title="Expand to fullscreen"
            >
              ⛶
            </button>
          </div>

          {/* Slides Area */}
          <div
            className="flex-1 overflow-hidden relative"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex h-full transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={index} className="min-w-full h-full p-4 sm:p-6 lg:p-10 flex items-center justify-center">
                  {slide}
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={() => changeSlide(-1)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/90 hover:bg-white shadow-lg text-whatsapp-500 text-2xl sm:text-3xl flex items-center justify-center transition-all hover:scale-110"
            >
              ‹
            </button>
            <button
              onClick={() => changeSlide(1)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/90 hover:bg-white shadow-lg text-whatsapp-500 text-2xl sm:text-3xl flex items-center justify-center transition-all hover:scale-110"
            >
              ›
            </button>
          </div>

          {/* Slide Controls */}
          <div className="p-3 sm:p-5 border-t border-slate-200 flex justify-between items-center">
            <div className="flex gap-1 sm:gap-2 flex-1 justify-center">
              {[...Array(TOTAL_SLIDES)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                    i === currentSlide ? 'bg-whatsapp-500 w-6 sm:w-8' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs sm:text-sm text-slate-600 ml-2 sm:ml-4 whitespace-nowrap">
              {currentSlide + 1}/{TOTAL_SLIDES}
            </span>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="w-full h-full flex flex-col">
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 w-14 h-14 rounded-full bg-slate-100 hover:bg-slate-200 text-whatsapp-500 text-3xl flex items-center justify-center transition-colors z-10"
            >
              ✕
            </button>

            {/* Slides */}
            <div
              className="flex-1 overflow-hidden relative"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex h-full transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slides.map((slide, index) => (
                  <div key={index} className="min-w-full h-full p-16 flex items-center justify-center">
                    {slide}
                  </div>
                ))}
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={() => changeSlide(-1)}
                className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 shadow-lg text-white text-4xl flex items-center justify-center transition-all hover:scale-110"
              >
                ‹
              </button>
              <button
                onClick={() => changeSlide(1)}
                className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 shadow-lg text-white text-4xl flex items-center justify-center transition-all hover:scale-110"
              >
                ›
              </button>
            </div>

            {/* Controls */}
            <div className="p-6 flex justify-between items-center bg-black/50">
              <div className="flex gap-3 flex-1 justify-center">
                {[...Array(TOTAL_SLIDES)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      i === currentSlide ? 'bg-whatsapp-500 w-10' : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-white/80 ml-4">
                Slide {currentSlide + 1} of {TOTAL_SLIDES}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
