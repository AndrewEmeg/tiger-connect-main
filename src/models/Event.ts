export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  organizer: string;
  image?: string;
  attendeeCount: number;
  category: string;
  studentOnly: boolean;
}

export const eventCategories = [
  "Academic",
  "Sports",
  "Cultural",
  "Social",
  "Career",
  "Club",
  "Other",
];

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Homecoming Week",
    description:
      "Join us for the annual Grambling State University Homecoming celebration! Events include parade, tailgating, football game, step show, and more.",
    startDate: new Date(2023, 10, 14),
    endDate: new Date(2023, 10, 20),
    location: "Various Locations on Campus",
    organizer: "GSU Student Activities",
    image: "/src/images/placeholder.png",
    attendeeCount: 450,
    category: "Social",
    studentOnly: false,
  },
  {
    id: "2",
    title: "Business School Career Fair",
    description:
      "Connect with top employers looking to hire Grambling graduates. Bring your resume and dress professionally.",
    startDate: new Date(2023, 9, 28),
    endDate: new Date(2023, 9, 28),
    location: "Business Building, Main Hall",
    organizer: "College of Business",
    image: "/src/images/placeholder.png",
    attendeeCount: 120,
    category: "Career",
    studentOnly: true,
  },
  {
    id: "3",
    title: "World Famous Tiger Marching Band Performance",
    description:
      "Special performance by Grambling's legendary marching band before the big game.",
    startDate: new Date(2023, 10, 5),
    endDate: new Date(2023, 10, 5),
    location: "Eddie G. Robinson Stadium",
    organizer: "Music Department",
    image: "/src/images/placeholder.png",
    attendeeCount: 275,
    category: "Cultural",
    studentOnly: false,
  },
  {
    id: "4",
    title: "STEM Research Symposium",
    description:
      "Showcase of undergraduate research projects in science, technology, engineering, and mathematics.",
    startDate: new Date(2023, 9, 15),
    endDate: new Date(2023, 9, 15),
    location: "Science Building Auditorium",
    organizer: "College of Science & Technology",
    image: "/src/images/placeholder.png",
    attendeeCount: 85,
    category: "Academic",
    studentOnly: true,
  },
  {
    id: "5",
    title: "Intramural Basketball Tournament",
    description:
      "Sign up your team for the fall intramural basketball championship. All skill levels welcome!",
    startDate: new Date(2023, 9, 20),
    endDate: new Date(2023, 10, 10),
    location: "Intramural Sports Complex",
    organizer: "Campus Recreation",
    image: "/src/images/placeholder.png",
    attendeeCount: 150,
    category: "Sports",
    studentOnly: true,
  },
  {
    id: "6",
    title: "Poetry Slam Night",
    description:
      "Open mic night for student poets to share their work in a competitive format.",
    startDate: new Date(2023, 9, 22),
    endDate: new Date(2023, 9, 22),
    location: "Student Union Coffeehouse",
    organizer: "Creative Writing Club",
    image: "/src/images/placeholder.png",
    attendeeCount: 60,
    category: "Cultural",
    studentOnly: false,
  },
  {
    id: "7",
    title: "Financial Literacy Workshop",
    description:
      "Learn about budgeting, credit scores, and student loan management from financial experts.",
    startDate: new Date(2023, 9, 25),
    endDate: new Date(2023, 9, 25),
    location: "Business Building, Room 204",
    organizer: "Student Success Center",
    image: "/src/images/placeholder.png",
    attendeeCount: 40,
    category: "Career",
    studentOnly: true,
  },
  {
    id: "8",
    title: "African Cultural Festival",
    description:
      "Celebration of African heritage with music, dance, food, and educational exhibits.",
    startDate: new Date(2023, 10, 1),
    endDate: new Date(2023, 10, 1),
    location: "Quadrangle",
    organizer: "African Student Association",
    image: "/src/images/placeholder.png",
    attendeeCount: 300,
    category: "Cultural",
    studentOnly: false,
  },
  {
    id: "9",
    title: "Graduate School Prep Seminar",
    description:
      "Information session on preparing for graduate school applications and entrance exams.",
    startDate: new Date(2023, 10, 3),
    endDate: new Date(2023, 10, 3),
    location: "Library Conference Room",
    organizer: "Academic Advising Office",
    image: "/src/images/placeholder.png",
    attendeeCount: 35,
    category: "Academic",
    studentOnly: true,
  },
  {
    id: "10",
    title: "Yoga on the Lawn",
    description:
      "Free yoga session open to all students, faculty, and staff. Mats provided.",
    startDate: new Date(2023, 10, 8),
    endDate: new Date(2023, 10, 8),
    location: "Front Campus Lawn",
    organizer: "Campus Wellness",
    image: "/src/images/placeholder.png",
    attendeeCount: 75,
    category: "Sports",
    studentOnly: false,
  },
  {
    id: "11",
    title: "Engineering Club Hackathon",
    description:
      "24-hour coding competition with prizes for the most innovative projects.",
    startDate: new Date(2023, 10, 11),
    endDate: new Date(2023, 10, 12),
    location: "Engineering Building Lab",
    organizer: "Engineering Student Association",
    image: "/src/images/placeholder.png",
    attendeeCount: 50,
    category: "Club",
    studentOnly: true,
  },
  {
    id: "12",
    title: "Alumni Networking Mixer",
    description:
      "Connect with successful GSU alumni in various professional fields.",
    startDate: new Date(2023, 10, 15),
    endDate: new Date(2023, 10, 15),
    location: "University Ballroom",
    organizer: "Alumni Affairs",
    image: "/src/images/placeholder.png",
    attendeeCount: 120,
    category: "Career",
    studentOnly: false,
  },
  {
    id: "13",
    title: "Jazz Ensemble Concert",
    description:
      "An evening of jazz classics and original compositions by our talented students.",
    startDate: new Date(2023, 10, 18),
    endDate: new Date(2023, 10, 18),
    location: "Performing Arts Center",
    organizer: "Music Department",
    image: "/src/images/placeholder.png",
    attendeeCount: 200,
    category: "Cultural",
    studentOnly: false,
  },
  {
    id: "14",
    title: "Midterm Study Jam",
    description:
      "Late-night study session with free snacks, tutoring, and quiet study spaces.",
    startDate: new Date(2023, 10, 22),
    endDate: new Date(2023, 10, 22),
    location: "Library",
    organizer: "Student Government",
    image: "/src/images/placeholder.png",
    attendeeCount: 180,
    category: "Academic",
    studentOnly: true,
  },
  {
    id: "15",
    title: "Volleyball Championship",
    description:
      "Cheer on the Lady Tigers as they face their conference rivals!",
    startDate: new Date(2023, 10, 25),
    endDate: new Date(2023, 10, 25),
    location: "Hobdy Assembly Center",
    organizer: "Athletics Department",
    image: "/src/images/placeholder.png",
    attendeeCount: 500,
    category: "Sports",
    studentOnly: false,
  },
  {
    id: "16",
    title: "Mental Health Awareness Day",
    description:
      "Workshops and activities focused on student mental health and wellness.",
    startDate: new Date(2023, 10, 28),
    endDate: new Date(2023, 10, 28),
    location: "Student Union",
    organizer: "Counseling Services",
    image: "/src/images/placeholder.png",
    attendeeCount: 90,
    category: "Social",
    studentOnly: false,
  },
  {
    id: "17",
    title: "Debate Team Exhibition",
    description:
      "Watch our award-winning debate team tackle current hot topics.",
    startDate: new Date(2023, 11, 2),
    endDate: new Date(2023, 11, 2),
    location: "Communication Arts Building",
    organizer: "Forensics Club",
    image: "/src/images/placeholder.png",
    attendeeCount: 65,
    category: "Academic",
    studentOnly: false,
  },
  {
    id: "18",
    title: "Winter Formal",
    description:
      "Semi-formal dance to celebrate the end of the semester. DJ and refreshments provided.",
    startDate: new Date(2023, 11, 5),
    endDate: new Date(2023, 11, 5),
    location: "University Ballroom",
    organizer: "Student Activities Board",
    image: "/src/images/placeholder.png",
    attendeeCount: 350,
    category: "Social",
    studentOnly: true,
  },
  {
    id: "19",
    title: "Final Exam Stress Relief",
    description:
      "Puppies, coloring books, and massage chairs to help you decompress before finals.",
    startDate: new Date(2023, 11, 8),
    endDate: new Date(2023, 11, 8),
    location: "Student Union Lounge",
    organizer: "Campus Wellness",
    image: "/src/images/placeholder.png",
    attendeeCount: 150,
    category: "Social",
    studentOnly: true,
  },
  {
    id: "20",
    title: "Computer Science Demo Day",
    description:
      "Seniors present their capstone projects to faculty and industry professionals.",
    startDate: new Date(2023, 11, 10),
    endDate: new Date(2023, 11, 10),
    location: "Computer Science Building",
    organizer: "CS Department",
    image: "/src/images/placeholder.png",
    attendeeCount: 75,
    category: "Academic",
    studentOnly: false,
  },
  {
    id: "21",
    title: "Gospel Choir Concert",
    description: "Annual holiday performance by the University Gospel Choir.",
    startDate: new Date(2023, 11, 12),
    endDate: new Date(2023, 11, 12),
    location: "University Chapel",
    organizer: "Music Department",
    image: "/src/images/placeholder.png",
    attendeeCount: 250,
    category: "Cultural",
    studentOnly: false,
  },
  {
    id: "22",
    title: "Resume Workshop",
    description:
      "Get one-on-one help improving your resume from career services staff.",
    startDate: new Date(2023, 11, 15),
    endDate: new Date(2023, 11, 15),
    location: "Career Center",
    organizer: "Career Services",
    image: "/src/images/placeholder.png",
    attendeeCount: 30,
    category: "Career",
    studentOnly: true,
  },
  {
    id: "23",
    title: "International Food Fair",
    description:
      "Sample cuisine from around the world prepared by international students.",
    startDate: new Date(2024, 0, 20),
    endDate: new Date(2024, 0, 20),
    location: "Student Union",
    organizer: "International Student Association",
    image: "/src/images/placeholder.png",
    attendeeCount: 400,
    category: "Cultural",
    studentOnly: false,
  },
  {
    id: "24",
    title: "MLK Day of Service",
    description: "Community service projects honoring Dr. King's legacy.",
    startDate: new Date(2024, 0, 15),
    endDate: new Date(2024, 0, 15),
    location: "Various Community Sites",
    organizer: "Office of Community Engagement",
    image: "/src/images/placeholder.png",
    attendeeCount: 200,
    category: "Social",
    studentOnly: false,
  },
  {
    id: "25",
    title: "Spring Involvement Fair",
    description:
      "Learn about student organizations and campus involvement opportunities.",
    startDate: new Date(2024, 0, 25),
    endDate: new Date(2024, 0, 25),
    location: "Quadrangle",
    organizer: "Student Activities",
    image: "/src/images/placeholder.png",
    attendeeCount: 600,
    category: "Social",
    studentOnly: true,
  },
  {
    id: "26",
    title: "Black History Month Lecture",
    description:
      "Keynote address by prominent scholar on African American history.",
    startDate: new Date(2024, 1, 5),
    endDate: new Date(2024, 1, 5),
    location: "Auditorium",
    organizer: "African American Studies",
    image: "/src/images/placeholder.png",
    attendeeCount: 180,
    category: "Academic",
    studentOnly: false,
  },
  {
    id: "27",
    title: "Entrepreneurship Pitch Competition",
    description: "Students present business ideas to win startup funding.",
    startDate: new Date(2024, 1, 15),
    endDate: new Date(2024, 1, 15),
    location: "Business Incubator",
    organizer: "Entrepreneurship Center",
    image: "/src/images/placeholder.png",
    attendeeCount: 75,
    category: "Career",
    studentOnly: true,
  },
  {
    id: "28",
    title: "Spring Theater Production",
    description: "Department of Theater presents 'A Raisin in the Sun'.",
    startDate: new Date(2024, 2, 1),
    endDate: new Date(2024, 2, 3),
    location: "Performing Arts Center",
    organizer: "Theater Department",
    image: "/src/images/placeholder.png",
    attendeeCount: 450,
    category: "Cultural",
    studentOnly: false,
  },
  {
    id: "29",
    title: "Women in STEM Panel",
    description:
      "Successful alumnae discuss careers in science and technology fields.",
    startDate: new Date(2024, 2, 8),
    endDate: new Date(2024, 2, 8),
    location: "Science Building",
    organizer: "Women in Science Club",
    image: "/src/images/placeholder.png",
    attendeeCount: 60,
    category: "Academic",
    studentOnly: false,
  },
  {
    id: "30",
    title: "Spring Break Send-Off",
    description: "Pre-break party with games, music, and safety reminders.",
    startDate: new Date(2024, 2, 15),
    endDate: new Date(2024, 2, 15),
    location: "Student Union",
    organizer: "Student Activities",
    image: "/src/images/placeholder.png",
    attendeeCount: 300,
    category: "Social",
    studentOnly: true,
  },
  {
    id: "31",
    title: "Research Poster Session",
    description:
      "Undergraduates present their research findings to the campus community.",
    startDate: new Date(2024, 3, 5),
    endDate: new Date(2024, 3, 5),
    location: "Library Atrium",
    organizer: "Office of Undergraduate Research",
    image: "/src/images/placeholder.png",
    attendeeCount: 100,
    category: "Academic",
    studentOnly: false,
  },
];
