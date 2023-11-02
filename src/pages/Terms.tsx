// https://gigaland.io/Connect-2.html

import { useNavigate } from "react-router-dom";

function TermsView() {
  const navigate = useNavigate();
  return (
    <section className="bg-white md:bg-[#F0E4FE]">
      <div className="flex items-start justify-center min-h-screen pt-12">
        <div className="bg-white w-full md:w-[384px] max-w-[calc(100%-20px)] rounded-[25px] px-6">
          <div className="flex items-center justify-end mb-4 mt-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="23"
              height="23"
              viewBox="0 0 23 23"
              fill="none"
              className="cursor-pointer"
              onClick={()=>navigate(-1)}
            >
              <circle cx="11.5" cy="11.5" r="11.5" fill="#CBCBCB" />
              <path
                d="M7.36133 7.35938L15.6413 15.6394"
                stroke="#1D1E1F"
              />
              <path
                d="M15.6406 7.35938L7.36063 15.6394"
                stroke="#1D1E1F"
              />
            </svg>
          </div>
          <div className="font-[Helvetica]">
            <div className="text-[1.6em] leading-[1.2em] font-bold mb-4">
              Designbook Terms and Conditions
            </div>
            <p className="text-base font-normal leading-[1.2em] mb-4">
              These are the terms and conditions of use for https://www.designbook.app ("Platform"). The Platform is operated by Designbook ltd of (“Designbook,” “we,” “us”, or “our”) and is a live marketplace that allows users to research, buy and sell certain types of consumer goods that are all linked to a digital certificate authenticatable on the blockchain.
            </p>
            <p className="text-base font-normal leading-[1.2em] mb-4">
              You are subject to these Terms & Conditions and by using them you agree to be bound by them. These Terms create a legal contract between you and us. Please read them carefully. We will collect and process personal data in accordance with our Privacy Policy
            </p>
            <p className="text-base font-bold leading-[1.2em] mb-6">
              By using our Sites and Services, or by clicking to accept these Terms, you accept and agree to be bound and abide by these Terms in full. If you do not agree to these Terms, do not use our Sites or any portion of the Services. For all purposes, the English version of the Terms shall be the original, binding instrument and understanding of the parties. In the event of any conflict between the English version of the Terms and any translation into any other language, the English version shall prevail and control.
            </p>
            <h3 className="text-base font-bold leading-[1.2em] mb-4">
              1. Changes to Terms and Policies.
            </h3>
            <p className="text-base font-normal leading-[1.2em] mb-6">
              Designbook may at its own discretion change the Terms (including the FAQs or any policy) at any time, but if we do, we will place a notice on our Site. We may also send you an email and/or notify you by some other means. Changes take effect on the date set out in the Terms. You should view these Terms often to stay informed of any changes that may affect you. YOUR CONTINUED USE OF THE SITE AND/OR SERVICES AFTER WE CHANGE THESE TERMS CONSTITUTES YOUR ACCEPTANCE OF THE CHANGES. IF YOU DO NOT AGREE TO ANY OF THE CHANGES, YOU MUST CANCEL YOUR ACCOUNT AND NOT USE ANY PORTION OF THE SERVICES.
            </p>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                2. Functioning of the Designbook Live Marketplace
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                Designbook platform and services are only permitted for use by persons who are 18 years and over. You consent and confirm you meet this requirement by using our Site and Services. You must have your parent or legal guardian’s permission prior to using the Site and Services if you are under the age of 18
              </p>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                Designbook is a live marketplace where third-party sellers can sell and list against products already chosen by us and listed on our Site. All sellers must possess the corresponding digital ownership certificate (the NFT) issued by the brands, as we only work with brands that emit digital certificates for each of their items sold. Buyers and sellers must register an account and connect a compatible Hedera wallet to be able to place, purchase or sell items. Options to place sells or purchase are as below:
              </p>
              <div className="mb-4">
                <ol className="list-decimal ml-8">
                  <li className="text-base font-normal leading-[1.2em]">
                    Buy Now: buyers can choose the ‘Buy Now’ option to secure an item, they are automatically matched with the lowest overall ask price to conclude the sale. The deal will be removed from the listing so other offers/bids can continue. The buyer’s wallet balance will be deducted from the item price plus shipping and tax fees, and funds will be secured into an escrow account pending item validation.
                  </li>
                  <li className="text-base font-normal leading-[1.2em]">
                    Sell Now: sellers can choose to Sell Now and close the transaction with the highest bid. The contract will be concluded once the seller proceeds with this option, and the seller's digital certificate is pulled into an escrow account along with the buyer’s funds while we wait to receive the seller item and complete verification.
                  </li>
                  <li className="text-base font-normal leading-[1.2em]">
                    Bidding: our live Marketplace will show the lowest offer at any given time. Buyer can click on ‘Place Bid’ to enter a new bid price against the offer price (their wallet balance will be validated for if it’s sufficient) and see if any sellers are willing to improve their offer. Other buyers can join the same bid, and the seller will be notified of any changes. Only bidders with sufficient balance in their wallet are able to place an order, this is to prevent market manipulation. Once a bid is matched with a seller offer, both buyer and seller are taken out of the listing. Funds and digital certificates are automatically pulled into an escrow account from wallets awaiting verification, and resumes with other parties involved.
                  </li>
                </ol>
              </div>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                More detailed descriptions on the live marketplace processes and requirements can be found on our FAQ page. Designbook is a platform where sellers and buyers can negotiate and transact, however all sales contracts are formed between the buyer and seller, we do not intervene with price setting nor an auctioneer. All contracts are subject to our item authenticity and condition verification.
              </p>
              <p className="text-base font-normal leading-[1.2em]">
                Designbook performs as the commercial agent to conclude the sale on behalf of buyers and sellers in each transaction. Designbook cannot guarantee that any item will sell. Prices displayed on our Site may be higher than retail value as they are determined by sellers. To the extent permitted by applicable law, Designbook reserves the right to suspend any buyer or seller account, perform investigation or charge additional fees if they violate our Terms.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                3. Accounts Security and Credentials
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                You must register an account on our Site by filling out the registration form. If you wish to place an offer on an item for sale or purchase (‘Sell Now’, ‘Place Ask’, ‘Buy Now’ or ‘Place Bid’) then you must connect a compatible Hedera wallet with sufficient credit to cover the offer/bid amounts. We validate your wallet balance upon any sales action taken to prevent market manipulation. You consent to any potential charges to your wallet that may arise for tax, item fulfilment and charges on violation of our Terms. When you register an account with us, you agree to share truthful personal information; no false name, age or payment method is used. You are responsible for ensuring confidentiality of your account information, and protection of your account credentials. You consent to reporting to Designbook risks of any fraudulent actions immediately upon learning them. You will be liable for any losses incurred if you permit a third party to use your account or credentials. You are not permitted to use another user's account or credentials without their consent. Designbook accounts cannot be transferred between users.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                4. Fees and Taxes
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                Information on our selling, shipping and other service fees are as described in our FAQ. Sellers are responsible and consent to pay, report, collect and remit all local, state, provincial, federal or international taxes, including VAT and sales tax, which are due with respect to the sales transactions. Buyers are responsible to pay all local, state, provincial, federal or international taxes, including VAT and sales tax, which are due with respect to the purchase transactions. Designbook as a marketplace facilitator is not responsible for reporting, filing, collecting and paying any taxes on seller and buyer’s behalf. You agree to provide Designbook with all relevant and accurate tax information which Designbook may share with tax authority in connection with payments you receive from us. Only to the extent necessary to complete a transaction and in line with our Privacy Policy, Designbook is authorised to release your information to tax authority or other government body where applicable. Your account face suspension if you fail to provide Designbook with all required tax information to support filing to appropriate tax authority.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                5. Authentication and Shipping
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                Physical items sold on Designbook must be shipped to Designbook office by sellers for visual inspection to verify authenticity and condition are up to our standards (see FAQ for details on acceptable condition standards). If the item is determined to be authentic and our condition standards are met, Designbook will ship the item to the buyer. If Designbook cannot determine that the item is authentic, or the item condition fails to meet our condition standards, we will notify the buyer and seller and issue a refund. Designbook has the right to reject any items if they fail our verification, and may charge the buyer for shipping fees for not respecting the terms and conditions and cancel the transaction. A seller with two or more attempts of shipping items that do not comply with our standards will be flagged and banned from our Site from future transactions.
                Designbook policy requires sellers to ship items to us within 2 working days after sales are concluded, and upon receiving our pre-paid labels. We cannot guarantee when buyer will receive the item as we cannot control the lead time it takes for item to reach Designbook. However, buyer cannot cancel an order if the item does not ship from the seller within the required timeframe or delayed due to other unforeseen circumstances. Once the item is received by us, we aim to complete authentication and ship the item to the buyer after 24 hours. Generally, items should reach buyers between 1-2 weeks depending on their geographical localization. If the item is not delivered after the latest estimated delivery date, the buyer should report the issue to DesignbooK. Designbook cannot accept returns, exchanges or swaps. If a buyer refuses to accept (or continuously misses) delivery of an item to his/her address on file for 30 days from first delivery attempt, we will charge the buyer expenses incurred due to rejection of delivery and consider the property abandoned.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                6. Fraudulent activities and counterfeits
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                Designbook reserves the right to take actions on any sellers that attempt to perform fraudulent activities, or interfere with fair and free operation of our platform. It is in our discretion to (i) remove the seller’s listing, suspend/block corresponding accounts and selling privileges; (ii) cancel any outstanding orders; (iii) withhold disbursement of funds; (iv) charge users for any costs incurred as a result of their actions; (v) notify relevant law enforcement agencies of the user’s activities; (vi) charge the user of any further investigation and service expenses.
              </p>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                Designbook only allows genuine items with valid digital certificates on our platform. All certificate numbers/tags are unique, if a copy circulates, it will immediately be known on the blockchain. The history of the transaction as well as the location will manage to determine instantly which is the non-genuine item. Attempts to violate this by sending us a counterfeit item which fails our verification, will result in the item being returned back to the seller and the verification and shipping fees will be deducted from the seller’s wallet. After the second attempt of shipping items which are counterfeit, the seller will be flagged and banned from the platform.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                7. Seller Responsibility
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                As a seller, by selecting Sell Now or placing an Ask, you are making a binding offer to sell that corresponding item to any buyer who will purchase by matching the offer price, and to ship the item as per guidance in our FAQ. You agree that you are responsible contractually and legally to deliver the same exact item for the agreed offer price. Once a Bid or Ask are matched, you may not cancel the listing. If you fail to fulfil the order, you will be fined additional fee for up to 15% of the transaction amount, plus the pre-paid shipping fee. Designbook reserves the right to do any of the following in its sole discretion: (i) remove seller from the listing; (ii) cancel any outstanding orders; (iii) withhold disbursement to seller; (iv) placing restriction on seller’s buying and selling privileges; (v) charge seller for expenses and fees incurred as a result of seller’s action; (vi) suspend or block seller’s account.
              </p>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                Designbook acts as an intermediary between the sellers and buyers. We are not liable for the performance or sales outcome of your listing on the platform. Once the seller's item is received and passed validation, we release the funds instantly in the seller's wallet, with our platform fees deducted. Fees applicable to each sales transaction can be viewed when seller enter an Ask price and more information can be found in our FAQ.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                8. Buyer Responsibility
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                If a buyer places a Bid on an item and the Bid is matched, the buyer is obligated to pay for that item. Buyer funds will be pulled into an escrow account waiting for item verification and receipt, no cancellation or refund will be honoured at this point. You will not receive an interest on the purchase amount whilst waiting for the order to be fulfilled. You must ensure you have sufficient funds in your wallet to cover the transaction, you will not be able to proceed with the purchase if your wallet balance falls below the required amount as we validate your wallet balance at the point when you place a purchase. If you do not receive the item within estimated timeframe, or experience a problem with the item you received, you must promptly contact Designbook (at help @designbook.app) with written details of the issues, within 3 days post receiving the item.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                9. Rules and Restrictions
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                Your item may or may not sell on our platform, Designbbook cannot guarantee the sales outcome through our services. Designbook does not provide any compensation for items that do not sell.
                The following actions are strictly prohibited on our platform:
              </p>
              <div className="mb-4">
                <ol className="list-decimal ml-8">
                  <li className="text-base font-normal leading-[1.2em]">
                    Use our services if you do not have legal binding contract, under legal age of 18 years old, or under suspension from our platform;
                  </li>
                  <li className="text-base font-normal leading-[1.2em]">
                    Operate on Designbook using false identity;
                  </li>
                  <li className="text-base font-normal leading-[1.2em]">
                    Transmit or upload unsolicited promotional materials, advertising or any other form of solicitation that pose the risk of scams;
                  </li>
                  <li className="text-base font-normal leading-[1.2em]">
                    Perform acts that violate local, state, national or international laws;
                  </li>
                  <li className="text-base font-normal leading-[1.2em]">
                    Use Designbook trademarks, websites assets in other places for commercial or personal use without our permission;
                  </li>
                  <li className="text-base font-normal leading-[1.2em]">
                    Repeatedly subscribe, register and unsubscribe;
                  </li>
                  <li className="text-base font-normal leading-[1.2em]">
                    Phishing, harvesting information about other uses, including email address;
                  </li>
                  <li className="text-base font-normal leading-[1.2em]">
                    Upload or share files that contain viruses, cancel-bots, Trojan horses, or other corrupted files and programmes that may damage our operation;
                  </li>
                  <li className="text-base font-normal leading-[1.2em]">
                    Copying and modifying our services and Sites for other use without our written consent;
                  </li>
                </ol>
              </div>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                Desigbook has sole discretion to take lawful action against any users in suspicion of violation of our Terms and any other actions deemed inappropriate and prohibited. Designbook may cooperate with legal authorities and law enforcement agencies to investigate and disclose evidence of any potential illegal acts. You will be liable to reimburse Designbook for any damages, costs (including fees paid to attorneys, accountants, other legal and defence professionals) as a result of you breaching our service terms and any unlawful prohibited actions.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                10. Intellectual Property.
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                You acknowledge and agree that copyrights, trademarks, service marks, trade secrets and other intellectual property (collectively, “Intellectual Property”) are our sole property, and nothing in these Terms shall confer in you any right of ownership or licence rights in our Intellectual Property. Any unauthorised reproduction, modification, distribution, transmission, republication, display, or performance of the software or the content through our Services is strictly prohibited.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                12. Indemnity.
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                You shall indemnify, defend and hold Designbook and our affiliates and their respective officers, directors, agents and employees harmless from and against all claims, demands, suits or other proceedings, and resulting loss, damage, liability, costs, interest and expenses (including reasonable attorneys’ fees) brought by any third party or governmental claim or demand that involves, relates to or concerns your listing or sale of any counterfeit, stolen, or illegal merchandise or goods, your breach of any provision of the Terms, your improper use of the Services, your violation of any law or the rights of a third party, or (e) federal, state, county, city, or other tax obligation or amounts due or owing under any tax regulation, law, order or decree. We reserve, and you grant to us, the right to assume exclusive defense and control of any matter subject to indemnification by you hereunder. All rights and duties of indemnification that are set forth herein shall survive termination of these Terms.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                13. Disclaimer of Warranties; Limitations of Liability.
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                You covenant not to sue Deisgnbook, and agree that you will not hold StockX responsible, for other users’ content, actions, or inactions. Deisgnbookis a marketplace for consumer goods. You acknowledge that you are buying items from a third party, not Deisgnbook. While we may help as your commercial agent facilitate the resolution of disputes, we have no control over and do not guarantee the accuracy, quality, safety, truth, accuracy or legality of User Content, listings, and/or items (including NFTs) listed or sold. If you have a dispute with one or more users, as a buyer or seller, you release and covenant not to sue Deisgnbook, its affiliated companies, and our and their respective officers, directors, agents, joint venturers, employees, legal representatives, and suppliers from any and all claims, demands and damages (actual and consequential) of every kind and nature, known and unknown, suspected and unsuspected, disclosed and undisclosed, arising out of or in any way connected with such dispute.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                17. Wallet Accounts.
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                In order to use the platform and Designbook platform, you must connect a wallet provided by Hashpack or Blade  (“wallets”) and you must accept the wallet own Terms of Service and Privacy Policy. Any funds held in the wallets account are held by wallets financial institution partners as set out in the wallets Terms of Service.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                18. Electronic Communications.
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                When you use the Services, or send e-mails, text messages, and other communications from your computer or mobile device to us, you are communicating with us electronically. You consent to receive communications from us electronically, such as e-mails, texts, mobile push notices, or notices and messages on this site, and you can retain copies of these communications for your records.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                21. Your Personal information
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                Use of your personal information submitted to or via the Site is governed by our Privacy Policy. We will only use your personal information in accordance with our Privacy Policy. Please take the time to read this carefully, as it indicates important information about how we collect and use personal information.
              </p>
            </div>
            <div className="mb-6">
              <h3 className="text-base font-bold leading-[1.2em] mb-4">
                27. Access to data
              </h3>
              <p className="text-base font-normal leading-[1.2em] mb-4">
                StockX will have access to buyers' and sellers' personal data which it shall use in accordance with StockX's <a className="text-[#007deb]" href="https://stockx.com/privacy">Privacy Policy</a>, as updated from time to time. StockX will also have access to non-personal data provided by buyers and sellers for the use of the Services or which is generated through the provision of those Services. This includes, for example, information on sellers' products to be displayed for purchase on the Sites, information provided by buyers and sellers when creating an account and information on all product purchases on the Sites. StockX shares information it has access to with third party service providers in order to provide the Services and improve customer experience. StockX will also retain such information after a seller deactivates or terminates their account, in accordance with applicable law.
                Sellers will have access to certain data through their online profile. This includes, for example, detail on their own sales history, including previous asks and bids. Sellers can request access to data about them after deactivating or terminating their account which StockX may be able to provide, provided that the data is still available, and it is permitted to do so under applicable law. Sellers will not have access to any personal data provided by buyers. Sellers will also have access to certain data that is publicly made available on the Sites. This includes, for example, ask and bid prices, product descriptions and the relative popularity of products sold on the Sites.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default TermsView;
