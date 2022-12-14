/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES } from "../constants/routes";
import { ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills"

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

//jest.mock("../app/store", () => mockStore)



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      /*const html = NewBillUI()
      document.body.innerHTML = html*/
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@test.tld",
        password: "employee",
        status: "connected"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })
    test("Then icon-mail in vertical layout should be highlighted", async () => {
      //await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      expect(windowIcon.classList.contains("active-icon")).toEqual(true)
    })//test passé au vert

    test("Then, employee should generate a bill by filling information", async () => {
      document.body.innerHTML = NewBillUI();

      const inputData = {
        expense: "Transports",
        name: "vol azerty",
        date: "2004-04-04",
        amount: "150",
        vat: "70",
        pct: "30",
        commentary: "clavier pas écolo",
        fileupload : "blabla.jpg"
      };

      const expenseType = screen.getByTestId('expense-type');
      fireEvent.change(expenseType, { target: { value: inputData.expense },});
      expect(expenseType.value).toBe(inputData.expense);

      const expenseName = screen.getByTestId('expense-name');
      fireEvent.change(expenseName, { target: { value: inputData.name },});
      expect(expenseName.value).toBe(inputData.name);


      const datePicker = screen.getByTestId('datepicker');
      fireEvent.change(datePicker, { target: { value: inputData.date },});
      expect(datePicker.value).toBe(inputData.date);

      const amount = screen.getByTestId('amount');
      fireEvent.change(amount, { target: { value: inputData.amount.toString() },});
      expect(amount.value).toBe(inputData.amount.toString());

      const vat = screen.getByTestId('vat');
      fireEvent.change(vat, { target: { value: inputData.vat },});
      expect(vat.value).toBe(inputData.vat);

      const pct = screen.getByTestId('pct');
      fireEvent.change(pct, { target: { value: inputData.pct.toString() },});
      expect(pct.value).toBe(inputData.pct.toString());

      const commentary = screen.getByTestId('commentary');
      fireEvent.change(commentary, { target: { value: inputData.commentary },});
      expect(commentary.value).toBe(inputData.commentary);

      const form = screen.getByTestId("form-new-bill");


      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const newBill = new NewBill({
        document,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      newBill.updateBill = (bill)=>{}

      newBill.fileUrl = "http://www.lala.com";
      newBill.fileName = "vol azerty.jpg";
      newBill.status ="pending";


      jest.spyOn(newBill, "updateBill")
      
      const handleSubmit = jest.fn(newBill.handleSubmit);
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      //console.log(window.localStorage.getItem("user"))
      expect(newBill.updateBill).toHaveBeenCalledWith(
        {
          email: "employee@test.tld",
          type: expenseType.value,
          name: expenseName.value,
          amount: 150,
          date: datePicker.value,
          vat: vat.value,
          pct: 30,
          commentary: commentary.value,
          fileUrl: newBill.fileUrl,
          fileName: newBill.fileName,
          status: newBill.status
        });

    })

    test("Then, employee try to upload a non jpg/jped/png file, but fails to do so", async () => {
      document.body.innerHTML = NewBillUI();
      const store = jest.fn()
      const localStorage = window.localStorage
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });


      const file = screen.getByTestId("file");
      
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      file.addEventListener("change", handleChangeFile)
      /*fireEvent.change(file, {
        target: {
          files: [new File(['(⌐□_□)'], '\\images\\chucknorris.jpg', {type: 'image/jpg'})],
        },
      })*/
      jest.spyOn(newBill, "clearInputFile")
      const upload = new File(["nom.pdf"],"nom.pdf")
      userEvent.upload(file, upload)
      //console.log("file.value", file.value)

      expect(newBill.clearInputFile).toHaveBeenCalled();

    })
    test ("Then, website set the Bill Id", ()=>{

      document.body.innerHTML = NewBillUI();
      const store = jest.fn()
      const localStorage = window.localStorage
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });


      newBill.setBillFile({fileUrl:"blabla.jpg", key:"123", fileName:"blabla.jpg", fileType:"jpg"});

      expect(newBill.billId).toBe("123")

    })
  })
})

