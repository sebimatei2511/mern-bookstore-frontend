import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CardSidebar from "../src/components/CardSidebar";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

// Simulare axios
vi.mock("axios");

describe("CardSidebar - Functionalitati Cos Cumparaturi", () => {
  const mockCartItems = [
    {
      productId: 101,
      title: "MongoDB: The Definitive Guide",
      author: "Shannon Bradshaw",
      price: 39.99,
      quantity: 2,
      imageUrl: "test-image.jpg",
    },
  ];

  const mockCart = {
    items: mockCartItems,
    total: 79.98,
    totalItems: 2,
  };

  const mockOnClose = vi.fn();

  const mockCartResponse = {
    data: { success: true, cart: mockCart },
  };

  const mockEmptyCartResponse = {
    data: {
      success: true,
      cart: { items: [], total: 0, totalItems: 0 },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.alert = vi.fn();
  });

  const renderComponent = (isOpen = true) => {
    return render(
      <BrowserRouter>
        <CardSidebar isOpen={isOpen} onClose={mockOnClose} />
      </BrowserRouter>
    );
  };

  it("nu ar trebui să fie vizibil când isOpen este false", () => {
    renderComponent(false);
    expect(screen.queryByText("Coșul de cumpărături")).not.toBeInTheDocument();
  });

  it("ar trebui să afișeze coșul cu produse când este deschis", async () => {
    axios.get.mockResolvedValueOnce(mockCartResponse);
    renderComponent(true);

    await waitFor(() => {
      // Folosim regex (/.../i) pentru a fi mai flexibili cu textul
      expect(screen.getByText(/Co[șs]ul de cumpărături/i)).toBeInTheDocument();
      expect(
        screen.getByText("MongoDB: The Definitive Guide")
      ).toBeInTheDocument();
      expect(screen.getByText("de Shannon Bradshaw")).toBeInTheDocument();
    });
  });

  it("ar trebui să afișeze coșul gol corect", async () => {
    axios.get.mockResolvedValueOnce(mockEmptyCartResponse);
    renderComponent(true);

    await waitFor(() => {
      // CORECTAT: Caută textul fără diacritice, așa cum e în componentă
      expect(screen.getByText(/Cosul tau este gol/i)).toBeInTheDocument();
    });
  });

  it("ar trebui să închidă sidebar-ul la click pe butonul de închidere", async () => {
    axios.get.mockResolvedValueOnce(mockCartResponse);
    renderComponent(true);

    await waitFor(() => {
      expect(screen.getByText(/Co[șs]ul de cumpărături/i)).toBeInTheDocument();
    });

    // CORECTAT: Caută litera 'x' mică, nu simbolul '×'
    const closeButton = screen.getByText("x");
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
