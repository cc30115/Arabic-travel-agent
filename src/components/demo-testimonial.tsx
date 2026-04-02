import React from "react";
import {Carousel, TestimonialCard} from "@/components/ui/retro-testimonial";
import {iTestimonial} from "@/components/ui/retro-testimonial";

type TestimonialDetails = {
	[key: string]: iTestimonial & {id: string};
};

const testimonialDataZH = {
	ids: [
		"t1", "t2", "t3", "t4", "t5"
	],
	details: {
		"t1": {
			id: "t1",
			description:
				"在過去的 25 年裡，我帶領家族體驗過無數奢華旅程，但 Khaymah 對於貝都因傳統的深刻理解與無微不至的禮賓服務，遠遠超乎我們的期待。每一次在星空下的晚宴，都是無價的永恆記憶。",
			profileImage:
				"https://images.unsplash.com/photo-1558222218-b7b54eede3f3?q=80&w=1000&auto=format&fit=crop",
			name: "James Cavendish",
			designation: "Executive Chairman, Global Equities",
		},
		"t2": {
			id: "t2",
			description:
				"服務超過 3000 位像我們一樣追求極致隱私的跨國貴賓，Khaymah 明白『奢華』不僅是豪華的物質享受，更是深度的文化連結。那是無法用金錢輕易衡量的阿拉伯靈魂。",
			profileImage:
				"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop",
			name: "Dr. Eleanor Vance",
			designation: "Art Philanthropist",
		},
		"t3": {
			id: "t3",
			description:
				"從接機的那一刻到我們抵達私人沙漠綠洲，二十多年來的專業積澱展露無遺。他們在無人之境創造了難以置信的綠洲宮殿，真正定義了現代阿拉伯壯遊史詩。",
			profileImage:
				"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
			name: "Marcus Rostova",
			designation: "Founder, Rostova Holdings",
		},
		"t4": {
			id: "t4",
			description:
				"這不僅僅是一趟旅行，這是一場洗滌心靈的朝聖。感謝 Khaymah 龐大而精準的團隊，讓我在極致寧靜的沙漠腹地找回了內心的平靜。世界頂級的款待，名不虛傳。",
			profileImage:
				"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop",
			name: "Sophia Martinez",
			designation: "Global Fashion Director",
		},
		"t5": {
			id: "t5",
			description:
				"他們在旅遊界超過二十五年的屹立不搖，不是沒有原因。最令我震撼的是營地夜晚那專屬的皇家禮遇，完全隱密且客製化，是我這輩子經歷過最高尚的款待。",
			profileImage:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
			name: "Arthur Pendelton",
			designation: "Real Estate Developer",
		},
	},
};

const testimonialDataEN = {
	ids: [
		"t1", "t2", "t3", "t4", "t5"
	],
	details: {
		"t1": {
			id: "t1",
			description:
				"Over the past 25 years, I have taken my family on countless luxury journeys, but Khaymah's profound understanding of Bedouin heritage and meticulous concierge service far exceeded our expectations. Every dinner under the stars is a priceless memory.",
			profileImage:
				"https://images.unsplash.com/photo-1558222218-b7b54eede3f3?q=80&w=1000&auto=format&fit=crop",
			name: "James Cavendish",
			designation: "Executive Chairman, Global Equities",
		},
		"t2": {
			id: "t2",
			description:
				"Having served over 3,000 discerning global guests who demand absolute privacy, Khaymah understands that true 'luxury' is deep cultural connection, not just material opulence. It is the soul of Arabia, delivered flawlessly.",
			profileImage:
				"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop",
			name: "Dr. Eleanor Vance",
			designation: "Art Philanthropist",
		},
		"t3": {
			id: "t3",
			description:
				"From the moment we arrived until we reached our private desert sanctuary, their 25+ years of expertise shone through. They manifested an incredible palace oasis in the middle of nowhere, truly defining the modern Arabian Odyssey.",
			profileImage:
				"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
			name: "Marcus Rostova",
			designation: "Founder, Rostova Holdings",
		},
		"t4": {
			id: "t4",
			description:
				"This was not just a trip; it was a soulful pilgrimage. Thanks to Khaymah's phenomenal team, I found pure tranquility in the heart of the majestic dunes. World-class hospitality that lives up to its legendary reputation.",
			profileImage:
				"https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop",
			name: "Sophia Martinez",
			designation: "Global Fashion Director",
		},
		"t5": {
			id: "t5",
			description:
				"Their 25-year legacy atop the industry exists for a reason. The royal treatment at our private camp was entirely bespoke and utterly secluded. The highest level of hosting I have experienced in my life.",
			profileImage:
				"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
			name: "Arthur Pendelton",
			designation: "Real Estate Developer",
		},
	},
};

const backgrounds = [
    "https://images.unsplash.com/photo-1528287942171-fbe365d1d9cb?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534120247760-c44c3e4a62f1?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505159940484-eb2b9f2588e2?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542051812871-758502109a29?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=1000&auto=format&fit=crop"
];

export const DemoOne = ({ lang = "en" }: { lang?: "en" | "zh" }) => {
    const data = lang === "zh" ? testimonialDataZH : testimonialDataEN;
    
	const cards = data.ids.map((cardId: string, index: number) => {
		const details = data.details as TestimonialDetails;
		return (
			<TestimonialCard
				key={cardId}
				testimonial={details[cardId]}
				index={index}
				backgroundImage={backgrounds[index % backgrounds.length]}
			/>
		);
	});

	return (
		<div className="w-full">
			<section className="py-20 relative">
				<div className="max-w-7xl mx-auto px-4 md:px-20 mb-10 text-center">
                    <p className="text-[#C5A059] tracking-[0.3em] text-xs uppercase mb-4 flex items-center justify-center gap-4">
                        <span className="w-8 h-px bg-[#C5A059]"></span> 
                        {lang === "zh" ? "卓越典範" : "Legacy of Excellence"} 
                        <span className="w-8 h-px bg-[#C5A059]"></span>
                    </p>
                    <h2 className="text-4xl md:text-6xl font-['Playfair_Display'] text-white leading-tight">
                        {lang === "zh" ? "傳奇，始於承諾" : "A Quarter Century of Mastery"}
                    </h2>
                    <p className="text-white/50 max-w-2xl mx-auto mt-6 text-sm leading-relaxed">
                        {lang === "zh" 
                            ? "二十五載的時光荏苒，我們很榮幸能為超過三千名全球頂尖貴賓服務。從古老沙丘到奢華帳篷，這不僅是住宿，更是改變生命的靈魂之旅。聆聽他們的故事：" 
                            : "With over 25 years in the industry, we have had the privilege to serve more than 3,000 elite global travelers. Listen to the stories of those who have embraced the true Arabian soul."}
                    </p>
                </div>
				<div className="w-full mx-auto px-0 md:px-10">
					<Carousel items={cards} />
				</div>
			</section>
		</div>
	);
};
