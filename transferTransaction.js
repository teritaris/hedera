const { Client, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");

require("dotenv").config();

async function main() {

    // 送信者の鍵情報をファイルから取得
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    // 取得ミスったらエラー表示
    if (myAccountId == null ||
        myPrivateKey == null) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    // Hedera JS SDK でテストネットに接続 makes this really easy!
    const client = Client.forTestnet();

    // オペレータ(手数料を払うアカウント)情報を設定
    client.setOperator(myAccountId, myPrivateKey);

    //Transfer Transactionを生成
    const sendHbar = await new TransferTransaction()
        .addHbarTransfer("0.0.49030243", Hbar.fromTinybars(-1000)) // 送信元アカウントID
        .addHbarTransfer("0.0.48451227", Hbar.fromTinybars(1000)) // 送信先アカウントID
        .execute(client);

    // トランザクションが承認されたか確認
    const transactionReceipt = await sendHbar.getReceipt(client);
    console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

    // クエリのコストを取得(今は0らしい)
    const queryCost = await new AccountBalanceQuery()
        .setAccountId("0.0.49030243")
        .getCost(client);
    console.log("The cost of query is: " + queryCost);

    // 送信後の残高を取得
    const getNewBalance = await new AccountBalanceQuery()
        .setAccountId("0.0.49030243")
        .execute(client);
    console.log("The account balance after the transfer is: " + getNewBalance.hbars.toTinybars() + " tinybar.")
}
main();
