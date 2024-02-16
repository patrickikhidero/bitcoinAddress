import csv
from typing import List

class MempoolTransaction:
    def _init_(self, txid, fee, weight, parents):
        self.Txid = txid
        self.Fee = fee
        self.Weight = weight
        self.Parents = parents
filename = '/Users/mac/Documents/Bitcoin Development/mempool.csv'
def parse_mempool_csv(filename):
    transactions = []

    with open(filename, 'r') as file:
        reader = csv.reader(file)
        lines = list(reader)

        for line in lines:
            txid = line[0]
            fee = int(line[1])
            weight = int(line[2])
            parents = set()

            if len(line) > 3 and len(line[3]) != 0:
                parent_txids = line[3].split(";")
                parents = set(parent_txids)

            transactions.append(MempoolTransaction(txid, fee, weight, parents))

    return transactions




def calculate_max_fee(transactions: List[MempoolTransaction]) -> List[str]:
    transactions.sort(key=lambda x: x.Fee, reverse=True)

    included_transactions = []
    included_set = set()
    total_weight = 0

    for transaction in transactions:
        parents_included = all(parent in included_set for parent in transaction.Parents)

        if parents_included:
            included_set.add(transaction.Txid)
            included_transactions.append(transaction.Txid)
            total_weight += transaction.Weight

            if total_weight >= 4000000:
                break

    return included_transactions

__main__
