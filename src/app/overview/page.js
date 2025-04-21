"use client";

import {useEffect, useState} from "react";
import axios from "axios";
import {useRouter} from "next/navigation";
import {format, parseISO} from "date-fns";
import {
    CalendarDays,
    User,
    Mail,
    BarChart2,
    CheckCircle,
    FileText,
    Pencil,
} from "lucide-react";
import dynamic from "next/dynamic";
import {fetchURL} from "@/constants";
import {useSelector} from "react-redux";

// Heatmap
const CalendarHeatmap = dynamic(() => import("react-calendar-heatmap"), {
    ssr: false,
});
import "react-calendar-heatmap/dist/styles.css";

export default function UserActivityPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const now = new Date();
    const startOfMonthLastYear = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month

    const userLogin = useSelector((state) => state.user);
    const {userInfo} = userLogin;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const headers = {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userInfo.token}`,
                };

                const res = await axios.get(`${fetchURL}/auth/users/overview?tz=${timezone}`, {
                    headers,
                });
                console.log("user overview data", res.data);
                setData(res.data);
            } catch (err) {
                console.error("Error fetching activity data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="animate-pulse text-xl text-cyan-600">Loading your profile...</p>
            </div>
        );

    if (!data)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-500 text-xl">No data found. Please try again later.</p>
            </div>
        );

    const {profile, daily_activity, year_summary} = data;
    console.log("object.entries year summary", Object.entries(year_summary));
    const heatmapData = Object.entries(year_summary).map(([date, count]) => ({
        date,
        count,
    }));
    console.log(heatmapData)
    const totalQuestions = daily_activity.reduce(
        (sum, day) => sum + day.questions_answered,
        0
    );
    const totalTestsCreated = daily_activity.reduce(
        (sum, day) => sum + (day.tests_created?.length || 0),
        0
    );
    const totalTestsCompleted = daily_activity.reduce(
        (sum, day) => sum + (day.tests_completed?.length || 0),
        0
    );
    const activeDays = heatmapData.filter((day) => day.count > 0).length;

    return (
        <main>
            <div
                className="w-[100%] max-w-6xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center bg-white">
                {/* Header */}
                <header className="mb-6 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold text-cyan-800">
                        Your Learning Journey
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base">
                        Track your progress and activity over time
                    </p>
                </header>

                {/* Profile and Summary */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-cyan-100 p-5 flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-cyan-100 p-3 rounded-full">
                                <User className="w-6 h-6 text-cyan-700"/>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-bold text-slate-800">{profile.name}</h2>
                                <p className="text-slate-600 text-sm flex items-center gap-1 mt-1">
                                    <Mail className="w-4 h-4"/> {profile.email}
                                </p>
                                {profile.joinedAt && (
                                    <p className="text-xs text-cyan-600 mt-1">
                                        Member since {format(parseISO(profile.joinedAt), "MMMM yyyy")}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/edit-profile")}
                            className="mt-auto ml-auto text-sm text-cyan-700 border border-cyan-200 px-3 py-1.5 rounded-md hover:bg-cyan-50 transition flex items-center gap-1"
                        >
                            <Pencil className="w-4 h-4"/> Edit
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                        {[
                            {
                                label: "Questions",
                                value: totalQuestions,
                                icon: <CheckCircle className="w-5 h-5 text-green-600"/>,
                                bg: "green-100",
                            },
                            {
                                label: "Tests Created",
                                value: totalTestsCreated,
                                icon: <FileText className="w-5 h-5 text-blue-600"/>,
                                bg: "blue-100",
                            },
                            {
                                label: "Tests Completed",
                                value: totalTestsCompleted,
                                icon: <BarChart2 className="w-5 h-5 text-purple-600"/>,
                                bg: "purple-100",
                            },
                            {
                                label: "Active Days",
                                value: activeDays,
                                icon: <CalendarDays className="w-5 h-5 text-amber-600"/>,
                                bg: "amber-100",
                            },
                        ].map((card, i) => (
                            <div
                                key={i}
                                className="bg-white border border-slate-100 rounded-xl p-4 flex items-center gap-3 shadow-sm"
                            >
                                <div className={`bg-${card.bg} p-2 rounded-full`}>{card.icon}</div>
                                <div>
                                    <p className="text-sm text-slate-500">{card.label}</p>
                                    <p className="text-xl font-bold text-slate-800">{card.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Daily Activity */}
                <section className="mb-10">
                    <h3 className="text-lg font-semibold mb-4 text-slate-700 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-cyan-600"/>
                        Recent Activity
                    </h3>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                        {daily_activity.map((day) => (
                            <div
                                key={day.date}
                                className="bg-white border rounded-lg p-3 text-xs shadow-sm hover:shadow-md transition"
                            >
                                <h4 className="font-medium text-slate-800 text-sm">
                                    {format(parseISO(day.date), "EEE")}
                                    <span className="block text-slate-500 text-xs">
                  {format(parseISO(day.date), "MMM d")}
                </span>
                                </h4>
                                <div className="mt-2 space-y-1">
                                    <div className="flex justify-between">
                                        <span>Questions</span>
                                        <span className="font-medium text-green-600">
                    {day.questions_answered}
                  </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Created</span>
                                        <span className="font-medium text-blue-600">
                    {day.tests_created?.length || 0}
                  </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Completed</span>
                                        <span className="font-medium text-purple-600">
                    {day.tests_completed?.length || 0}
                  </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Heatmap */}
                <section className="mb-10 overflow-scroll w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                        <h3 className="text-lg font-semibold text-slate-700">Yearly Activity Heatmap</h3>
                        <div className="text-sm text-slate-500 flex items-center gap-2 mt-2 sm:mt-0">
                            <span>Less</span>
                            <div className="flex gap-1">
                                {[0, 1, 2, 3, 4].map((lvl) => (
                                    <div
                                        key={lvl}
                                        className={`w-4 h-4 rounded-sm border ${
                                            lvl === 0
                                                ? "bg-gray-100 border-gray-200"
                                                : `bg-cyan-${lvl * 200} border-cyan-${lvl * 200 + 100}`
                                        }`}
                                    />
                                ))}
                            </div>
                            <span>More</span>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border overflow-x-auto">
                        <div className="w-[50rem] md:w-full">
                            <CalendarHeatmap
                                className={""}
                                startDate={startOfMonthLastYear}
                                endDate={endOfCurrentMonth}
                                values={heatmapData}
                                classForValue={(value) => {
                                    if (!value || value.count === 0) return "color-empty";
                                    if (value.count < 10) return "color-scale-1";
                                    if (value.count < 20) return "color-scale-2";
                                    if (value.count < 50) return "color-scale-3";
                                    if (value.count < 100) return "color-scale-4";
                                    if (value.count > 100) return "color-scale-5";
                                    return "color-scale-4";
                                }}
                                tooltipDataAttrs={(value) =>
                                    value?.date
                                        ? {
                                            "data-tip": `${value.date}: ${value.count} activities`,
                                        }
                                        : null
                                }
                                showWeekdayLabels
                                gutterSize={2}
                                titleForValue={(value) => `Activity Points : ${value ? value["count"] : 0}`}
                            />

                        </div>
                    </div>
                    <p className="text-center text-sm text-slate-500 mt-3">
                        Your learning activity across {new Date().getFullYear()}
                    </p>
                </section>
            </div>
        </main>
    );
}
