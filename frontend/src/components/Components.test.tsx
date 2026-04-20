import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { test, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";

import ClipCard from "./ClipCard";
import ActivityCard from "./ActivityCard";
import CommunityCard from "./CommunityCard";


// --------------------
// ClipCard test
// --------------------
test("ClipCard renders correctly", () => {
  render(
    <MemoryRouter>
      <ClipCard title="Test Clip" />
    </MemoryRouter>
  );

  expect(screen.getByText("Test Clip")).toBeInTheDocument();
  expect(screen.getByText(/User/i)).toBeInTheDocument();
});


// --------------------
// ActivityCard test
// --------------------
test("ActivityCard renders title", () => {
  render(<ActivityCard title="Activity Test" />);
  expect(screen.getByText("Activity Test")).toBeInTheDocument();
});


// --------------------
// CommunityCard test
// --------------------
test("CommunityCard renders title", () => {
  render(<CommunityCard title="Community Test" />);
  expect(screen.getByText("Community Test")).toBeInTheDocument();
});