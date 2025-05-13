import Image from "next/image";
import Link from "next/link";
import CardsCarousel from "@/components/cards_carousel";
import 'katex/dist/katex.min.css';

export async function generateMetadata({params}) {

    // Ensure cover image is absolute URL
    const coverImage = 'https://synapticz.com/images/icon.png';

    return {
        title: "Synapticz",
        description: "Think-Recall-Retain",
        metadataBase: new URL('https://synapticz.com'),
        openGraph: {
            title: "Synapticz",
            description: "The Quiz App. Think-Recall-Retain",
            url: `/`,
            siteName: 'Synapticz',
            images: [
                {
                    url: coverImage,
                    width: 1200,
                    height: 630,
                    alt: "Synapticz",
                },
            ],
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: "Synapticz",
            description: "The Quiz App. Think-Recall-Retain\"",
            images: [coverImage],
        },
        robots: {
            index: true,
            follow: true,
            nocache: false,
            googleBot: {
                index: true,
                follow: true,
                noimageindex: false,
            },
        }
    };
}

const cardContentData = [
    {
        image: "/images/active_recall.jpg",
        imageDescription: "active recall",
        contentTitle: "Strengthen Your Memory with Active Recall",
        contentText:
            "The best way to remember what you learn is to actively retrieve it from memory — not just passively reread. Synapticz helps you do exactly that. By regularly taking quizzes on what you've studied, you're training your brain to recall information — a method proven by science to enhance long-term retention and understanding.",
    },
    {
        image: "/images/detailed_results.jpg",
        imageDescription: "detailed results",
        contentTitle: "Know Where You Stand",
        contentText:
            "After every quiz or test, Synapticz gives you detailed results and performance statistics — not just scores. See how you performed across topics, track your progress over time, and understand your strengths and weaknesses. Want to push yourself further? Compare your performance with others to see where you stand in the competition.",
    },
    {
        image: "/images/multiple_subjects.jpg",
        imageDescription: "multiple subjects",
        contentTitle: "Multiple Subjects",
        contentText:
            "Whether you're preparing for school exams or learning something new, you can create or take quizzes on virtually any subject. From physics to philosophy, history to programming — just type what you want to learn and start testing yourself instantly.",
    },
    {
        image: "/images/spaced_repetition.jpg",
        imageDescription: "spaced repetition",
        contentTitle: "Spaced Repetition That Works",
        contentText:
            "Our app uses spaced repetition, a proven technique that boosts long-term memory by helping you recall information just before you're about to forget it. The more you review, the longer you remember — and the app adapts this schedule for you.",
    },
    {
        image: "/images/test_modes.jpg",
        imageDescription: "test modes",
        contentTitle: "Choose How You Learn",
        contentText:
            "Synapticz gives you the freedom to learn your way. Want to practice? Use Practice Mode to go through questions at your own pace. Ready to test your skills? Switch to Timed Test Mode for a more exam-like experience.",
    },
    {
        image: "/images/bookmark.jpg",
        imageDescription: "bookmark and save",
        contentTitle: "Bookmark What Matters",
        contentText:
            "Found a tricky question or a brilliant explanation? Just bookmark it. Save important questions and their explanations to revisit anytime — perfect for quick reviews or deep dives later.",
    },
];

export default function Home() {
    return (
        <main className={"gap-0"}>
            {/* Hero Section */}
            <section
                className="hero-section px-6 py-6 mb-2 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white w-full flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                    Welcome to <span className="text-cyan-400">Synapticz</span>
                </h1>
                <p className="text-lg md:text-lg max-w-3xl text-gray-300 leading-relaxed">
                    Supercharge your learning with active recall, spaced repetition, and personalized quizzes powered by
                    science and AI.
                </p>
            </section>


            <section className={"w-full z-[-1]"}>
                <CardsCarousel cards={cardContentData}/>
            </section>
            <div className="w-full flex justify-center py-4 gap-2 md:gap-6">
                <Link
                    href="/ai-quiz-generator"
                    className="relative bg-[#2a395c] hover:bg-[#1e293b] hover:opacity-[#0f172a]
                  text-white py-4 px-10  shadow-md hover:shadow-2xl
                  text-lg tracking-wide transition-all duration-300 hover:scale-[1.03]
                  transform-gpu overflow-hidden group"
                >
        <span className="absolute inset-0  opacity-0
                        group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center justify-center gap-2 text-[.8rem] md:text-[1rem]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            AI Quiz Generator
        </span>
                </Link>

                <Link
                    href="/quizzes"
                    className="relative bg-[#2a395c] hover:bg-[#1e293b]  text-white py-4 px-10 rounded shadow-md over:shadow-2xl
                  text-lg tracking-wide transition-all duration-300 hover:scale-[1.03]
                  transform-gpu overflow-hidden group"
                >
        <span className="absolute inset-0 opacity-0
                        group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center justify-center gap-2 text-[.8rem] md:text-[1rem]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            Browse Quizzes
        </span>
                </Link>
            </div>

        </main>
    );
}
