/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom/extend-expect";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import router from "../app/Router.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then, it should them in the page", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
      expect(screen.getByText("Type de dépense")).toBeTruthy();
      expect(screen.getByText("Nom de la dépense")).toBeTruthy();
      expect(screen.getByText("Date")).toBeTruthy();
      expect(screen.getByText("Montant TTC")).toBeTruthy();
      expect(screen.getByText("TVA")).toBeTruthy();
      expect(screen.getByText("Commentaire")).toBeTruthy();
      expect(screen.getByText("Justificatif")).toBeTruthy();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
    test("Then mail icon in vertical layout should be highlighted", () => {
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
      window.onNavigate(ROUTES_PATH.NewBill);

      const iconMail = screen.getByTestId("icon-mail");
      expect(iconMail).toBeTruthy();
      expect(iconMail).toHaveClass("active-icon");
    });
    test("Then, the NewBill is on the screen", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("datepicker").value).toBe("");
      expect(screen.getByTestId("amount").value).toBe("");
      expect(screen.getByTestId("file").value).toBe("");
      expect(screen.getByTestId("expense-type").value).toBe("Transports");
      expect(screen.getByTestId("expense-name").value).toBe("");
      expect(screen.getByTestId("amount").value).toBe("");
      expect(screen.getByTestId("vat").value).toBe("");
      expect(screen.getByTestId("commentary").value).toBe("");

      const formNewBill = screen.getByTestId("form-new-bill");
      const sendNewBill = jest.fn((e) => e.preventDefault());
      formNewBill.addEventListener("submit", sendNewBill);
      fireEvent.submit(formNewBill);
      expect(sendNewBill).toHaveBeenCalled();
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
    describe("When I choose an image to upload ", () => {
      test("Then, input file should have a correct extension", () => {
        const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: null,
        });
        const html = NewBillUI();
        document.body.innerHTML = html;

        const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
        const fileInput = screen.getByTestId("file");
        fileInput.addEventListener("change", handleChangeFile);

        const extensionsFile = ["jpeg", "jpg", "png"];
        const file = new File(["content"], "image.jpg", { type: "image/jpg" });
        fireEvent.change(fileInput, { target: { files: [file] } });
        expect(handleChangeFile).toBeCalled();

        const fileName = fileInput.files[0].name;
        const extension = fileName.split(".")[1];
        expect(extensionsFile.includes(extension)).toBeTruthy();
      });
      test("Then, input file should have a incorrect extension", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBill = new NewBill({
          document,
          onNavigate,
          store: null,
          localStorage: window.localStorage,
        });
        const html = NewBillUI();
        document.body.innerHTML = html;

        const handleChangeFile = jest.fn(() => newBill.handleChangeFile);

        const fileInput = screen.getByTestId("file");
        fileInput.addEventListener("change", handleChangeFile);

        const extensionsFile = ["jpeg", "jpg", "png"];
        const file = new File(["content"], "fichier.pdf", {
          type: "fichier/pdf",
        });
        fireEvent.change(fileInput, { target: { files: [file] } });
        expect(handleChangeFile).toBeCalled();

        const fileName = fileInput.files[0].name;
        const extension = fileName.split(".")[1];
        expect(extensionsFile.includes(extension)).toBeFalsy();
        expect(screen.getByTestId("file").value).toBe("");
        await waitFor(() =>
          screen.getByText("L'image doit être au format jpeg, jpg ou png")
        );
        expect(
          screen.getByText("L'image doit être au format jpeg, jpg ou png")
        ).toBeTruthy();
      });
    });
  });
});
describe("When i download the file in the correct format ", () => {
  test("Then the newbill is send", () => {
    const html = NewBillUI();
    document.body.innerHTML = html;

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    const newBill = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });
    const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));

    const fichier = screen.getByTestId("file");
    const testFormat = new File(["content"], "test.jpg", {
      type: "image/jpg",
    });
    fichier.addEventListener("change", handleChangeFile);
    fireEvent.change(fichier, { target: { files: [testFormat] } });

    expect(handleChangeFile).toHaveBeenCalled();
    expect(fichier.files[0]).toStrictEqual(testFormat);

    const formNewBill = screen.getByTestId("form-new-bill");
    expect(formNewBill).toBeTruthy();

    const sendNewBill = jest.fn((e) => newBill.handleSubmit(e));
    formNewBill.addEventListener("submit", sendNewBill);
    fireEvent.submit(formNewBill);
    expect(sendNewBill).toHaveBeenCalled();
    expect(screen.getByText("Mes notes de frais")).toBeTruthy();
  });
});

// POST newBill
describe("Given I am a user connected as an employee", () => {
  describe("When I create a new bill", () => {
    test("Then it should fetches new bill to mock API POST and redirected me to Bills Page", async () => {
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

      jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
        return {
          create: () => {
            return Promise.resolve();
          },
        };
      });

      window.onNavigate(ROUTES_PATH.NewBill);
      await new Promise(process.nextTick);
      const headerTitle = screen.getByText("Mes notes de frais");
      expect(headerTitle).toBeTruthy();
    });
  });
  describe("When I create a new bill and an error occurs on API", () => {
    beforeEach(() => {
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

      test("Then fetches bills to mock API POST and fails with 404 message error", async () => {
        jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("Then fetches new bill to mock API POST and fails with 500 message error", async () => {
        jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
          return {
            create: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.NewBill);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });

  describe("When bill form is submited", () => {
    const newBill = {
      id: "47qAXb6fIm2zOKkLzMro",
      vat: "80",
      fileUrl:
        "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      status: "pending",
      type: "Hôtel et logement",
      commentary: "séminaire billed",
      name: "encore",
      fileName: "preview-facture-free-201801-pdf-1.jpg",
      date: "2004-04-04",
      amount: 400,
      commentAdmin: "ok",
      email: "a@a",
      pct: 20,
    };
    test("then create Bill and redirect to Bills", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const bill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      screen.getByTestId("expense-type").value = newBill.type;
      screen.getByTestId("expense-name").value = newBill.name;
      screen.getByTestId("amount").value = newBill.amount;
      screen.getByTestId("datepicker").value = newBill.date;
      screen.getByTestId("vat").value = newBill.vat;
      screen.getByTestId("pct").value = newBill.pct;
      screen.getByTestId("commentary").value = newBill.commentary;
      bill.fileUrl = newBill.fileUrl;
      bill.fileName = newBill.fileName;

      const submit = screen.getByTestId("form-new-bill");

      const handleSubmit = jest.fn((e) => bill.handleSubmit(e));
      submit.addEventListener("click", handleSubmit);
      fireEvent.click(submit);
      expect(handleSubmit).toHaveBeenCalled();
      expect(global.window.location.pathname).toEqual("/");
    });
  });
});
