"use client"

import Image from "next/image";
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter();

    const arrayOfCardContent = [{
        image: "/images/active_recall.jpg",
        imageDescription: "active recall",
        contentTitle: "Strengthen Your Memory with Active Recall",
        contentText: "The best way to remember what you learn is to actively retrieve it from memory — not just passively reread. Synapticz helps you do exactly that.\n" + "By regularly taking quizzes on what you've studied, you're training your brain to recall information — a method proven by science to enhance long-term retention and understanding."
    },
        {
            image: "/images/detailed_results.jpg",
            imageDescription: "detailed results",
            contentTitle: "Know Where You Stand",
            contentText: "After every quiz or test, Synapticz gives you detailed results and performance statistics — not just scores. See how you performed across topics, track your progress over time, and understand your strengths and weaknesses.\n" + "\n" + "Want to push yourself further? Compare your performance with others to see where you stand in the competition"
        },
        {
            image: "/images/multiple_subjects.jpg",
            imageDescription: "multiple subjects",
            contentTitle: "Multiple subjects",
            contentText: "Create or take quizzes on any subject and exam. With the help of AI, you can create or take quizzes on any subjects you want."
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
    return (<main className={"flex flex-col p-4 items-center"}>
        <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full h-[calc(200vh)] md:h-[calc(110vh)] lg:h-[calc(100vh-8rem)]">
            {arrayOfCardContent.map((cardContent, index) => (<div
                key={index}
                className="border border-gray-500 h-full w-full flex flex-col gap-0 items-center p-4"
            >
                <h1 className={"content-title text-[1.1rem] text-gray-700 uppercase mb-2 font-bold"}>{cardContent.contentTitle}</h1>
                {/* Image Container - 1/3 width */}
            <div className="card-main-body flex gap-2">
                <div className="w-1/3 h-full flex justify-center items-center overflow-hidden">
                    <Image
                        className="object-contain w-full h-full"
                        src={cardContent.image}
                        alt={cardContent.imageDescription}
                        width={300}
                        height={300}
                    />
                </div>

                {/* Content Container - 2/3 width */}
                <div className="w-2/3 h-full p-4  flex flex-col justify-center items-center overflow-hidden">

                    <p className={"content-body text-gray-600"}>
                        {cardContent.contentText}
                    </p>
                </div>
            </div>
            </div>))}
        </div>
        <div className="button-containe w-full flex justify-center items-center border-[1px] border-gray-500 p-4 ml-16 mr-16">
            <button className={"browse-quiz-button bg-blue-800 p-4 text-white uppercase w-[25rem]"} onClick={()=>{
                router.push("/quizzes")
            }}>Browse Quizzes</button>
        </div>

    </main>);
}
//just a small change