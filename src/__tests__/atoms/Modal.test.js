import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

import { Modal } from "../../components/atoms/Modal";

it("renders message", () => {
  const setVisible = jest.fn();
  const visible = true;
  const blur = false;

  const modalChildText = "Modal Child";
  const { getByText } = render(
    <Modal setVisible={setVisible} visible={visible} blur={blur}>
      <div>Modal Child</div>
    </Modal>
  );
  expect(getByText(modalChildText)).toBeInTheDocument();
});
