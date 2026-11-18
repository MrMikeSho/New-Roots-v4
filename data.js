/* Sample content shown in preview mode (and until Supabase has rows) */
const CITIES=["Harare", "Bulawayo", "Mutare", "Banket", "Beatrice", "Beitbridge", "Bindura", "Birchenough Bridge", "Chegutu", "Chimanimani", "Chinhoyi", "Chipinge", "Chiredzi", "Chirundu", "Chitungwiza", "Chivhu", "Concession", "Epworth", "Filabusi", "Gokwe", "Guruve", "Gutu", "Gwanda", "Gweru", "Headlands", "Hwange", "Hwedza", "Juliasdale", "Kadoma", "Kariba", "Karoi", "Kwekwe", "Lupane", "Macheke", "Mahusekwa", "Maphisa", "Marondera", "Mashava", "Masvingo", "Mazowe", "Mount Darwin", "Murehwa", "Mutoko", "Mvurwi", "Norton", "Nyanga", "Plumtree", "Redcliff", "Rusape", "Ruwa", "Shamva", "Shurugwi", "Triangle", "Tsholotsho", "Victoria Falls", "Zaka", "Zvishavane", "Other (Zimbabwe)"];
const CATS={jobs:"Jobs & Piece Work",housing:"Housing",community:"Churches & Community"};
const ICON={jobs:"💼",housing:"🏠",community:"⛪"};
window.listings=[
 {title:"House Helper / Maid needed in Borrowdale",category:"jobs",city:"Harare",description:"Looking for a reliable house helper, Monday to Friday, light duties, cooking and childcare...",price:"$50/week",contact_name:"Chipo",phone:"+263712000001"},
 {title:"Single Room to Rent — Mutare Town",category:"housing",city:"Mutare",description:"Clean single room available immediately near Mutare town center. Shared kitchen, water included.",price:"$40/month",contact_name:"Rutendo",phone:"+263714000005"},
 {title:"3-Room House for Rent — Suburbs",category:"housing",city:"Mutare",description:"Spacious 3-room house in a safe suburb. Has garden, borehole water. Ideal for a single parent with children.",price:"$120/month",contact_name:"Farai",phone:"+263714000008"},
 {title:"Grace Fellowship — Single Parents Support Group",category:"community",city:"Harare",description:"Monthly support group for single parents, counseling sessions, and community dinners. All are welcome.",price:"Free",contact_name:"Rev. Chinyama",phone:"+263712000007"},
 {title:"New Life Community Church — Family Services",category:"community",city:"Bulawayo",description:"Welcoming church offering Sunday family services, children's programs, and community meals for families.",price:"Free",contact_name:"Pastor Moyo",phone:"+263713000004"},
 {title:"Childminder Available — Highlands Area",category:"jobs",city:"Harare",description:"Experienced childminder available to care for children aged 1–8 years. References available.",price:"$10/day",contact_name:"Gracious",phone:"+263712000006"},
 {title:"2 Bedroom Cottage for Rent — Avondale",category:"housing",city:"Harare",description:"Secure and affordable 2-bedroom cottage in quiet Avondale neighborhood. Perfect for a small family.",price:"$180/month",contact_name:"Tendai",phone:"+263712000002"},
 {title:"Piece Work — Garden & Yard Maintenance",category:"jobs",city:"Bulawayo",description:"Available weekends for garden work, lawn mowing, and general yard upkeep.",price:"$15/day",contact_name:"Sipho",phone:"+263713000003"}
];
window.news=[
 {tag:"Resources",source:"Zimbabwe Family Network",date:"2026-03-28",title:"New Rerai Umntwana App: Parenting Advice in Your Pocket",excerpt:"The Ministry of Health and Child Care has launched the Rerai Umntwana app to provide Zimbabwean caregivers with evidence-based guidance on early childhood care and development.",url:"#"},
 {tag:"Events",source:"Rudo Roots Community",date:"2026-10-05",title:"Bulawayo Single Parents Forum: Building Resilience Together",excerpt:"Join us at the Theological College of Zimbabwe on October 17 for a supportive gathering dedicated to single parents. This forum brings together families to share experiences and practical support.",url:"#"},
 {tag:"Support",source:"Rudo Roots Community",date:"2026-11-10",title:"Affordable Nutrition: Cooking Tips for Busy Parents",excerpt:"Learn how to combine locally available foods to create balanced, nutritious meals for your children without breaking the bank. Our community cooks share their best tips.",url:"#"},
 {tag:"Jobs",source:"Village Herald",date:"2026-08-20",title:"Community Gardens Offer New Livelihood Opportunities in Mutare",excerpt:"Solar-powered community gardens in Mutare are providing a vital lifeline for families, allowing for year-round crop production and a steady income.",url:"#"},
 {tag:"Housing",source:"Zimbabwe Family Network",date:"2026-05-25",title:"Finding Safe Housing: Navigating Support Systems",excerpt:"For single parents facing housing instability, it is important to know that community-led support networks are available to help you find safe, affordable accommodation.",url:"#"},
 {tag:"Community",source:"Rudo Roots Community",date:"2026-09-15",title:"Prioritizing Mental Health: Why Self-Care is Essential",excerpt:"Parenting alone is a demanding task that requires immense strength, but remember that your well-being is just as important as your children's.",url:"#"}
];
const BOARDS={
 help:{t:"Ask for Help",b:"Post a need — the village responds"},
 gathering:{t:"Parenting Gatherings",b:"Meet-ups, playdates & workshops"},
 donation:{t:"Donations & Support",b:"Give or receive community support"},
 swap:{t:"Childcare Swaps",b:"Share childcare with trusted members"},
 resource:{t:"Resources",b:"Parenting guides & helpful links"},
 member:{t:"Member Profiles",b:"Connect with families near you"}
};

window.SAMPLE_POSTS=[
 {type:"gathering",title:"Saturday playdate & tea — Mutare Park",body:"Bring the kids and a snack. We meet 10am by the playground, everyone welcome.",city:"Mutare",contact_name:"Rutendo",phone:"+263714000005",created_at:new Date(Date.now()-3600e3*3).toISOString()},
 {type:"help",title:"Need school uniform for Grade 2",body:"Looking for a second-hand uniform (size 7) for my daughter starting next term. Any help is appreciated.",city:"Harare",contact_name:"Chipo",phone:"+263712000001",created_at:new Date(Date.now()-3600e3*9).toISOString()},
 {type:"donation",title:"Free baby clothes 0–12 months",body:"Clean, gently used baby clothes to give away. Collect from Avondale this weekend.",city:"Harare",contact_name:"Tendai",phone:"+263712000002",created_at:new Date(Date.now()-3600e3*26).toISOString()},
 {type:"swap",title:"Childcare swap — weekday afternoons",body:"I can mind 2 kids Mon/Wed afternoons in exchange for Fri mornings. Highlands area.",city:"Harare",contact_name:"Gracious",phone:"+263712000006",created_at:new Date(Date.now()-3600e3*50).toISOString()},
 {type:"resource",title:"Free parenting workshop recording",body:"A recorded session on budgeting as a single parent — message me for the link.",city:"Bulawayo",contact_name:"Sipho",phone:"+263713000003",created_at:new Date(Date.now()-3600e3*72).toISOString()}
];

listings.forEach((l,i)=>l.id="s-l"+i);SAMPLE_POSTS.forEach((p,i)=>p.id="s-p"+i);
