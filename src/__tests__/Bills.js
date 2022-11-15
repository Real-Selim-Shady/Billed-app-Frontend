/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
//import { dataSorted } from "../views/BillsUI.js" // ajout par Selim
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router"
import Bills from "../containers/Bills.js";

//import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)
/*import request from 'supertest'
import sinon from 'sinon'
import app from '../../app'
import * as itemQueries from '../../db/queries/item.query'*/

describe("Given I am connected as an employee", () => {
  /*beforeEach(()=>
  bills.handleClickIconEye = jest.fn()
  )*/
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      //expect(windowIcon).toEqual("active-icon")
      expect(windowIcon.classList.contains("active-icon")).toEqual(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      //console.log("dates", dates);
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("Then, employee can click on icon eye and show the picture justifying the bill", async () => {

      jest.spyOn(mockStore, "bills")
      /*Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('userTest', JSON.stringify({
        type: 'Employee',
        email: "employee@test.tld",
        password: "Employee",
        status: "connected"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()*/ //commenter tout ça ne change rien
      //window.onNavigate(ROUTES_PATH.Bills) commenter la ligne ne change rien


      //let PREVIOUS_LOCATION = "";

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const store = jest.fn();
      //const localStorage = window.localStorage

      const bills = new Bills({
        document,
        onNavigate,
        //store:null,
        store,
        localStorage: window.localStorage,
        //PREVIOUS_LOCATION,
      });

      const iconEye = [screen.getAllByTestId('icon-eye')];
      const iconEye1 = iconEye[0]
      const iconEye1a = iconEye1[0] 
      
      iconEye1a.onclick = function(){}

      userEvent.click(iconEye1a)
      //expect(handleClickIconEye2).toHaveBeenCalled()


    })
  })
})


//test d'intégration GET

describe("Given I am a user connected as Employee", () => {

  describe("When I am on Bills Page", () => {

    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Statut"))
      const contentRefused  = await screen.getAllByText("refused")
      expect(contentRefused).toBeTruthy()
      const contentAccepted  = await screen.getAllByText("accepted")
      expect(contentAccepted).toBeTruthy()
      const contentPending  = await screen.getAllByText("pending")
      expect(contentPending).toBeTruthy()
    })


    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: "a@a"
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
        test("fetches bills from an API and fails with 404 message error", async () => {

          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 404"))
              }
            }})
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          //console.log("screen 404 bills", screen)
          const message1 = await screen.getByText(/Erreur 404/)
          expect(message1).toBeTruthy()
        })
        test("fetches messages from an API and fails with 500 message error", async () => {

          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 500"))
              }
            }})

          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message2 = await screen.getByText(/Erreur 500/)
          expect(message2).toBeTruthy()
        })

        test("2fetches messages from an API and fails with 500 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 500"))
              }
            }
          })


            
        })


    })
  })
})


