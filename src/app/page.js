import Image from "next/image";
import Link from "next/link";
import CardsCarousel from "@/components/cards_carousel";

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
        <main>
            {/* Hero Section */}
            <section
                className="hero-section px-6 py-8 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white w-full flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                    Welcome to <span className="text-cyan-400">Synapticz</span>
                </h1>
                <p className="text-lg md:text-lg max-w-3xl text-gray-300 leading-relaxed">
                    Supercharge your learning with active recall, spaced repetition, and personalized quizzes powered by
                    science and AI.
                </p>
            </section>

            <section className={"w-full z-[-1]"} >
                <CardsCarousel cards={cardContentData}/>
            </section>

            <div className="w-full flex justify-center py-12">
                <Link
                    href="/quizzes"
                    className="bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-blue-500 hover:to-cyan-600 text-white py-4 px-10 rounded-full shadow-lg text-lg tracking-wide transition-all duration-300 hover:scale-105"
                >
                    Browse Quizzes
                </Link>
            </div>

        </main>
    );
}
