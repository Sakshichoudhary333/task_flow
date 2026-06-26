import React from "react";
import { render, screen } from "@testing-library/react";
import Login from "./pages/Login";
const mockReact = React;

jest.mock(
  "react-router-dom",
  () => ({
    Link: ({ children, ...props }) => mockReact.createElement("a", props, children),
    useNavigate: () => jest.fn(),
    useLocation: () => ({ state: null }),
  }),
  { virtual: true }
);

jest.mock("./context/AuthContext", () => ({
  useAuth: () => ({
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: false,
    authLoading: false,
    token: "",
    user: null,
  }),
}));

test("renders the login page", () => {
  render(<Login />);

  expect(
    screen.getByRole("heading", { name: /login/i })
  ).toBeInTheDocument();
});
