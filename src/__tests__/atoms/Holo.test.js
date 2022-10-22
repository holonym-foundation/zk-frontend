import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { act } from "react-dom/test-utils";

import Holo from "../../components/atoms/Holo";

it("renders holo (i.e., name, bio, twitter, google, github, orcid)", () => {
  const testHolo = {
    name: "Anonymous",
    bio: "No information provided",
    twitter: "@anonymous",
    google: "anon@gmail.com",
    github: "anongit",
    orcid: "0000-0000-0000-0000",
  };
  render(<Holo holo={testHolo} />);
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
  // const holoComponent = screen.getByText(/No information provided/);
  // expect(holoComponent).toBeInTheDocument();
  // expect(container.textContent).toBe("Hello, Jenny!");

  // act(() => {
  //   render(<Holo name="Margaret" />, container);
  // });
  // expect(container.textContent).toBe("Hello, Margaret!");
});

// test("renders learn react link", () => {
//   render(<App />);
//   const linkElement = screen.getByText(/learn react/i);
//   expect(linkElement).toBeInTheDocument();
// });

// it("Should render", () => {
//   render(<Holo holo={defaultHolo} />);
// });

// test("renders Holo", () => {});

// // import { unmountComponentAtNode } from "react-dom";

// // let container = null;
// // beforeEach(() => {
// //   // setup a DOM element as a render target
// //   container = document.createElement("div");
// //   document.body.appendChild(container);
// // });

// // afterEach(() => {
// //   // cleanup on exiting
// //   unmountComponentAtNode(container);
// //   container.remove();
// //   container = null;
// // });

// import { render, screen } from "@testing-library/react";
// import App from "../App";

// import Holo from "../components/atoms/Holo";

// // test("renders learn react link", () => {
// //   render(<App />);
// //   const linkElement = screen.getByText(/learn react/i);
// //   expect(linkElement).toBeInTheDocument();
// // });

// test("renders Holo", () => {
//   const defaultHolo = {
//     address: "",
//     name: "Anonymous",
//     bio: "No information provided",
//     twitter: "",
//     google: "",
//     github: "",
//     orcid: "",
//   };
//   render(<Holo holo={defaultHolo} />);
// });
