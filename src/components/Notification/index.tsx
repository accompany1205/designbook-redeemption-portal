import { timeout } from "q";
import React, { useEffect, useRef, useContext, ReactNode, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";

export const NotificationTypeValue = {
    SUCCESS: 'success',
    ERROR: 'error',
    INFO: 'info'
}

interface NotificationType {
    children: ReactNode;
}

const Notification: React.FC<NotificationType> = ({ children }) => {

    const { notificationState } = useContext(AuthContext);
    const [notificationShow, setNotificationShow] = useState<boolean>(false);
    const rootRef = useRef(null);
    useEffect(() => {
        if (!notificationState) return;
        setNotificationShow(true);
        const timer = setTimeout(() => {
            if (rootRef && rootRef.current) {

            }
            setNotificationShow(false);
        }, notificationState?.timeout || 3000)

        return () => clearTimeout(timer);
    }, [notificationState])
    if (!notificationState) {
        return <>{children}</>
    }
    return (
        <>
            {notificationShow &&
                // <div className="fixed left-0 top-0 flex justify-center items-center bg-[#863ddb40] w-full min-h-screen font-[Helvetica]">
                <div className="fixed left-0 top-0 flex justify-center items-center w-full min-h-screen font-[Helvetica]">
                    {notificationState?.type === NotificationTypeValue.SUCCESS &&
                        <div ref={rootRef} className="bg-white border-2 border-solid border-grey rounded-[25px] w-full md:w-[384px] max-w-[calc(100%-20px)] pt-8 pb-10">
                            <div className="text-2xl font-bold text-center text-[#0FBC00] mb-4 mx-8">{notificationState?.text}</div>
                            <div className="flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><g fill="#0FBC00"><path d="M10.243 16.314L6 12.07l1.414-1.414l2.829 2.828l5.656-5.657l1.415 1.415l-7.071 7.07Z" /><path fill-rule="evenodd" d="M1 12C1 5.925 5.925 1 12 1s11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12Zm11 9a9 9 0 1 1 0-18a9 9 0 0 1 0 18Z" clipRule="evenodd" /></g></svg>

                            </div>
                        </div>}
                    {notificationState?.type === NotificationTypeValue.ERROR &&
                        <div ref={rootRef} className="bg-white border-2 border-solid border-grey rounded-[25px] w-full md:w-[384px] max-w-[calc(100%-20px)] pt-8 pb-10">
                            <div className="text-2xl font-bold text-center text-[#FF1744] mb-4">{notificationState?.text}</div>
                            <div className="flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 2048 2048"><path fill="#FF1744" d="M1024 0q141 0 272 36t244 104t207 160t161 207t103 245t37 272q0 141-36 272t-104 244t-160 207t-207 161t-245 103t-272 37q-141 0-272-36t-244-104t-207-160t-161-207t-103-245t-37-272q0-141 36-272t104-244t160-207t207-161T752 37t272-37zm0 1920q124 0 238-32t214-90t181-140t140-181t91-214t32-239q0-124-32-238t-90-214t-140-181t-181-140t-214-91t-239-32q-124 0-238 32t-214 90t-181 140t-140 181t-91 214t-32 239q0 124 32 238t90 214t140 181t181 140t214 91t239 32zm443-1249l-352 353l352 353l-90 90l-353-352l-353 352l-90-90l352-353l-352-353l90-90l353 352l353-352l90 90z" /></svg>

                            </div>
                        </div>}
                    {notificationState?.type === NotificationTypeValue.INFO &&
                        <div ref={rootRef} className="bg-white border-2 border-solid border-grey rounded-[25px] w-full md:w-[384px] max-w-[calc(100%-20px)] pt-8 pb-10">
                            <div className="text-2xl font-bold text-center text-[#1769aa] mb-4">{notificationState?.text}</div>
                            <div className="flex justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="#1769aa" d="M11 17h2v-6h-2v6Zm1-8q.425 0 .713-.288T13 8q0-.425-.288-.713T12 7q-.425 0-.713.288T11 8q0 .425.288.713T12 9Zm0 13q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22Zm0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20Zm0-8Z" /></svg>
                            </div>
                        </div>}
                </div>
            }
            {children}
        </>
    )
}

export default Notification;