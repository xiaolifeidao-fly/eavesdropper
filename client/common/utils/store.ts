
function getKey(key: string){
    return "jarvis_view_1" + key;
}


class LocalStore {

    getItem(key: string){
        return localStorage.getItem(getKey(key));
    }

    setItem(key: string, value : any){
        localStorage.setItem(getKey(key), value);
    }

    removeItem(key: string){
        localStorage.removeItem(getKey(key));
    }

}

const storeInstance = new LocalStore()

export default storeInstance;


