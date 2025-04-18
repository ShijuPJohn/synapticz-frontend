import Image from "next/image";
import Link from "next/link";

export default function Home() {

    const arrayOfCardContent = [{
        image: "/images/active_recall.jpg",
        imageDescription: "active recall",
        contentTitle: "Strengthen Your Memory with Active Recall",
        contentText: "The best way to remember what you learn is to actively retrieve it from memory — not just passively reread. Synapticz helps you do exactly that.\n" + "By regularly taking quizzes on what you've studied, you're training your brain to recall information — a method proven by science to enhance long-term retention and understanding."
    }, {
        image: "/images/detailed_results.jpg",
        imageDescription: "detailed results",
        contentTitle: "Know Where You Stand",
        contentText: "After every quiz or test, Synapticz gives you detailed results and performance statistics — not just scores. See how you performed across topics, track your progress over time, and understand your strengths and weaknesses.\n" + "\n" + "Want to push yourself further? Compare your performance with others to see where you stand in the competition"
    }, {
        image: "/images/multiple_subjects.jpg",
        imageDescription: "multiple subjects",
        contentTitle: "Multiple subjects",
        contentText: "Whether you're preparing for school exams, you can create or take quizzes on virtually any subject. With the help of AI, you're not limited to a fixed syllabus. From physics to philosophy, history to programming — just type what you want to learn, and start testing yourself instantly."
    }, {
        image: "/images/spaced_repetition.jpg",
        imageDescription: "spaced repetition",
        contentTitle: "Spaced Repetition That Actually Works",
        contentText: "Our app uses spaced repetition, a proven technique that boosts long-term memory by helping you recall information just before you're about to forget it. The more you review, the longer you remember — and the app adapts this schedule for you."
    }, {
        image: "/images/test_modes.jpg",
        imageDescription: "test modes",
        contentTitle: "Choose how you learn: Test Modes",
        contentText: "Synapticz gives you the freedom to learn your way.\n" + "\n" + "Want to practice? Use Practice Mode to go through questions at your own pace, review explanations, and learn deeply.\n" + "\n" + "Ready to test your skills? Switch to Timed Test Mode for a more exam-like experience."
    },

        {
            image: "/images/bookmark.jpg",
            imageDescription: "bookmark and save",
            contentTitle: "Bookmark What Matters",
            contentText: "Found a tricky question or a brilliant explanation? Just bookmark it.\n" + "\n" + "With Synapticz, you can save important questions and their explanations to revisit anytime — perfect for quick reviews or deep dives later. Learning at your own pace just got easier."
        },]
    return (<main>
        <div
            className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 w-full min-h-[calc(200vh)] md:min-h-[calc(110vh)] lg:min-h-[calc(100vh-8rem)]">
            {arrayOfCardContent.map((cardContent, index) => (<div
                key={index}
                className="rounded-xl h-full w-full flex flex-col gap-0 items-center p-2 md:p-4 bg-[rgba(255,255,255,.3)]"
            >

                {/* Image Container - 1/3 width */}
                <div className="card-main-body flex flex-col md:flex-row gap-2 h-full">
                    <div className="w-full md:h-full h-40 md:w-1/3 flex relative  border bg-[rgba(0,0,0,.3)] border-gray-400 rounded-xl border-none">
                        <Image
                            className="object-contain h-full"
                            src={cardContent.image}
                            alt={cardContent.imageDescription}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>

                    {/* Content Container - 2/3 width */}
                    <div className="w-full md:w-2/3 p-2 md:pl-4  flex flex-col justify-center items-center overflow-hidden">
                        <h1 className={"content-title text-[1.1rem] text-gray-700 uppercase mb-2 font-bold "}>{cardContent.contentTitle}</h1>
                        <p className={"content-body text-gray-600 text-[.8rem] md:text-[.85rem] lg:text-[.9rem]"}>
                            {cardContent.contentText}
                        </p>
                    </div>
                </div>
            </div>))}
        </div>
        <div
            className="button-container w-full flex justify-center items-center p-4 ml-16 mr-16">
            <Link href={"/quizzes"} className={"browse-quiz-button bg-blue-800 p-4 text-white uppercase w-[25rem] flex items-center justify-center"}>Browse
                Quizzes
            </Link>
        </div>

    </main>);
}
//just a small change