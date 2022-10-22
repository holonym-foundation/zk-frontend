import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";

import { InfoButton } from "../components/info-button";

it("renders InfoButton and makes info text visible", async () => {
  const text = "testing";
  render(<InfoButton text={text} />);
  expect(screen.getByText(text)).toBeInTheDocument();
  expect(screen.getByText(text)).not.toBeVisible();
  const user = userEvent.setup();
  await user.click(screen.getByRole("button"));
  expect(screen.getByText(text)).toBeVisible();
});
