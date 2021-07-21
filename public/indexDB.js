let db;

const request = indexedDB.open('BudgetTracker_DB', 1);

request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    db.createObjectStore("DB_Store", {autoIncrement: true});
  };

request.onerror = ({target}) => {
    console.log(`REQUEST FAILED - ${target.errorCode}`);
};

function checkDB() {
    console.log('Checking Database...');

    let transaction = db.transaction(['DB_Store'], 'readwrite');

    const store = transaction.objectStore('DB_Store');

    const allRecords = store.getAll();

    allRecords.onsuccess = () => {

        if (allRecords.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(allRecords.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((res) => {

                    if (res.length !== 0) {

                        transaction = db.transaction(['DB_Store'], 'readwrite');
                        const newStore = transaction.objectStore('DB_Store');

                        newStore.clear();
                        console.log('Clearing store 🧹');
                    }
                });
        }
    };
}

request.onsuccess = ({target}) => {
    console.log('REQUEST SUCCESSUL');
    db = target.result;

    if (navigator.onLine) {
        checkDB();
    }
};

const saveRecord = (record) => {
    console.log('Saving record...');

    const transaction = db.transaction(['DB_Store'], 'readwrite');
    const store = transaction.objectStore('DB_Store');

    store.add(record);
};

window.addEventListener('online', checkDB);