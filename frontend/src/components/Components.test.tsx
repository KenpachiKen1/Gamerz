import { render, screen } from "@testing-library/react";
import { test, expect } from "vitest";

import ClipCard from "./ClipCard";
import ActivityCard from "./ActivityCard";
import CommunityCard from "./CommunityCard";


// ClipCard tests
test("ClipCard renders title", () => {
  render(<ClipCard title="Test Clip" />);
  expect(screen.getByText("Test Clip")).toBeTruthy();
});

test("ClipCard shows Watch button", () => {
  render(<ClipCard title="Test Clip" />);
  expect(screen.getAllByText("Watch").length).toBeGreaterThan(0);
});


// ActivityCard tests
test("ActivityCard renders title", () => {
  render(<ActivityCard title="Activity Test" />);
  expect(screen.getByText("Activity Test")).toBeTruthy();
});


// CommunityCard tests
test("CommunityCard renders correctly", () => {
  render(<CommunityCard title="Community Test" />);
  expect(screen.getByText("Community Test")).toBeTruthy();
});