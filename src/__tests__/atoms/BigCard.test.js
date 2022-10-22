import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import BigCard from "../../components/atoms/BigCard";

it("renders BigCard with holo data", () => {
  const testHolo = {
    name: "Anonymous",
    bio: "No information provided",
    twitter: "@anonymous",
    google: "anon@gmail.com",
    github: "anongit",
    orcid: "0000-0000-0000-0000",
  };
  render(<BigCard holo={testHolo} />);
  const name = screen.getByText(testHolo.name);
  expect(name).toBeInTheDocument();
  const bio = screen.getByText(testHolo.bio);
  expect(bio).toBeInTheDocument();
  const twitter = screen.getByText(testHolo.twitter);
  expect(twitter).toBeInTheDocument();
  const google = screen.getByText(testHolo.google);
  expect(google).toBeInTheDocument();
  const github = screen.getByText(testHolo.github);
  expect(github).toBeInTheDocument();
  const orcid = screen.getByText(testHolo.orcid);
  expect(orcid).toBeInTheDocument();
});
