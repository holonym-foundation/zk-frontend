import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { ORCIDLoginButton, TwitterLoginButton, GitHubLoginButton, GoogleLoginButton } from "../../components/atoms/LoginButtons";

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedUsedNavigate,
}));

it("renders Login Buttons", () => {
  render(<ORCIDLoginButton />);
  expect(screen.getByText("Link ORCID")).toBeInTheDocument();
  render(<ORCIDLoginButton creds="test" />);
  expect(screen.getByText("Update ORCID")).toBeInTheDocument();
  render(<TwitterLoginButton />);
  expect(screen.getByText("Link Twitter")).toBeInTheDocument();
  render(<TwitterLoginButton creds="test" />);
  expect(screen.getByText("Update Twitter")).toBeInTheDocument();
  render(<GitHubLoginButton />);
  expect(screen.getByText("Link GitHub")).toBeInTheDocument();
  render(<GitHubLoginButton creds="test" />);
  expect(screen.getByText("Update GitHub")).toBeInTheDocument();
  render(<GoogleLoginButton />);
  expect(screen.getByText("Link Google")).toBeInTheDocument();
  render(<GoogleLoginButton creds="test" />);
  expect(screen.getByText("Update Google")).toBeInTheDocument();
});
