import { createContext } from "react";

export const AppContext = createContext();

const AppContextProvider = ({children}) => {
    const currency = '$';

    const calculateAge = (dob) => {

        const today = new Date();
        const birthDate = new Date(dob);

        let age = today.getFullYear() - birthDate.getFullYear();
        return age
    }


    const value = {
       calculateAge,
       currency
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;