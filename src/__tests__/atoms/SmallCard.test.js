import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import SmallCard from "../../components/atoms/SmallCard";

it("renders SmallCard with holo data", () => {
  const testHolo = {
    name: "Anonymous",
    bio: "No information provided",
    twitter: "@anonymous",
    google: "anon@gmail.com",
    github: "anongit",
    orcid: "0000-0000-0000-0000",
  };
  const testHref = "testHref";
  render(<SmallCard holo={testHolo} href={testHref} />);

  const name = screen.getByText(testHolo.name);
  expect(name).toBeInTheDocument();
  const bio = screen.getByText(testHolo.bio);
  expect(bio).toBeInTheDocument();

  const links = screen.getAllByRole("link");
  expect(links[0]).toHaveAttribute("href", testHref);
  expect(links[1]).toHaveAttribute("href", `https://twitter.com/${testHolo.twitter}`);
  expect(links[2]).toHaveAttribute("href", `mailto:${testHolo.google}`);
  expect(links[3]).toHaveAttribute("href", `https://github.com/${testHolo.github}`);
  expect(links[4]).toHaveAttribute("href", `https://orcid.org/${testHolo.orcid}`);
});
