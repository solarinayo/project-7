// src/data/courses.ts

export interface Course {
  id: string;
  name: string;
  virtualPrice: number;
  physicalPrice: number;
}

export const courses: Course[] = [
  {
    id: "frontend",
    name: "Web Dev (Frontend)",
    virtualPrice: 100000,
    physicalPrice: 150000,
  },
  {
    id: "backend",
    name: "Web Dev (Backend)",
    virtualPrice: 150000,
    physicalPrice: 200000,
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    virtualPrice: 200000,
    physicalPrice: 250000,
  },
  { id: "web3", name: "Web3", virtualPrice: 100000, physicalPrice: 150000 },
  {
    id: "data_analysis",
    name: "Data Analysis",
    virtualPrice: 200000,
    physicalPrice: 250000,
  },
  {
    id: "ui_ux",
    name: "Product Design (UI/UX)",
    virtualPrice: 150000,
    physicalPrice: 180000,
  },
];
