import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import MessageScreen from "../../components/atoms/MessageScreen";

it("renders message", () => {
  const testMsg = "Please work";
  render(<MessageScreen msg={testMsg} />);
  const name = screen.getByText(testMsg);
  expect(name).toBeInTheDocument();
});
