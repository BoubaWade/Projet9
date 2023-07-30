/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom/extend-expect";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Actions from "../views/Actions.js";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //---------------to-do write expect expression--------------
      expect(windowIcon).toBeTruthy();
      expect(windowIcon).toHaveClass("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });

    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
  describe("When I am on Bills Page and I click on icon eye", () => {
    test("Then, modale File should appear", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      document.body.innerHTML = BillsUI({ data: bills });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const instanceBills = new Bills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });
      $.fn.modal = jest.fn();
      const handleClickIconEye = jest.fn(() => {
        instanceBills.handleClickIconEye;
      });
      const iconEye = screen.getAllByTestId("icon-eye");
      iconEye.forEach((icon) => {
        icon.addEventListener("click", handleClickIconEye);
        fireEvent.click(icon);
      });
      expect(handleClickIconEye).toHaveBeenCalled();
    });
  });
  describe("When I am on Bills Page and I click on button new-bills", () => {
    test("Then, new bill page should appear", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBillsPage = new Bills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });

      const OpenNewBill = jest.fn(newBillsPage.handleClickNewBill);
      const buttonNewBill = screen.getByTestId("btn-new-bill");
      buttonNewBill.addEventListener("click", OpenNewBill);
      fireEvent.click(buttonNewBill);

      expect(OpenNewBill).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });
});

// test d'intégration GET bills
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate on Bills Page", () => {
    test("Then, it should them in the page", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      const buttonNewBill = screen.getByTestId("btn-new-bill");
      expect(buttonNewBill).toBeTruthy();
    });

    describe("When fetches bills list is successul ", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("Then, bills have an Properties", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.resolve(bills);
            },
          };
        });
        expect(bills.length).toEqual(4);

        expect(bills[0]).toHaveProperty("id", "47qAXb6fIm2zOKkLzMro");
        expect(bills[0]).toHaveProperty("vat", "80");
        expect(bills[0]).toHaveProperty(
          "fileUrl",
          "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a"
        );
        expect(bills[0]).toHaveProperty("status", "pending");
        expect(bills[0]).toHaveProperty("type", "Hôtel et logement");
        expect(bills[0]).toHaveProperty("commentary", "séminaire billed");
        expect(bills[0]).toHaveProperty("name", "encore");
        expect(bills[0]).toHaveProperty(
          "fileName",
          "preview-facture-free-201801-pdf-1.jpg"
        );
        expect(bills[0]).toHaveProperty("date", "2004-04-04");
        expect(bills[0]).toHaveProperty("amount", 400);
        expect(bills[0]).toHaveProperty("commentAdmin", "ok");
        expect(bills[0]).toHaveProperty("email", "a@a");
        expect(bills[0]).toHaveProperty("pct", 20);
      });
    });
  });
});
