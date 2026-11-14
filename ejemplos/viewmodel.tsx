import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { DateHandler, NumbersHandler, useRepositories } from "../../../core";
import { ErrorMessages, Mold, Product, Shift, SuccessMessages, MoldFamily, type CalculateMaximumTraysReq, type CalculateMaximumTraysRes, type CreateProductionOrderReq, type GetAllMoldReq, type GetAllProductReq, type GetAllProductRes, type GetAllShiftRes, type MaximumTraysInfo, type GetAllMoldFamilyRes } from "../../../domain";
import useSession from "../../hooks/useSession";
import ProductionOrderFormHandler from "../../forms/handlers/production-order-form-handler";

export default function ViewModel() {

    /* --- Hooks --- */
    const navigate = useNavigate();

    /* --- Custom Hooks --- */
    const { user, logout, session } = useSession();

    /* --- Providers --- */
    const { productionOrderRepository, productRepository, moldRepository, shiftRepository } = useRepositories();

    /* --- States --- */
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [molds, setMolds] = useState<Mold[]>([]);
    const [families, setFamilies] = useState<MoldFamily[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [maxTrays, setMaxTrays] = useState<MaximumTraysInfo | null>(null);

    /* --- Form --- */
    const {
        formValues,
        formErrors,
        selectedProduct,
        selectedFamily,
        selectedMold,
        selectedShift,
        onFormChange,
        validateForm,
        setSupportValues,
    } = ProductionOrderFormHandler();


    /* --- UseEffects --- */
    useEffect(() => {
        setLoading(true);
        fetchData().then(() => setLoading(false));
    }, [session]);

    useEffect(() => {
        if (products.length > 0 && molds.length > 0 && shifts.length > 0) {
            setSupportValues(products, molds, shifts, families);
        }
    }, [products, molds, shifts, families]);

    useEffect(() => {
        if (session && selectedProduct && selectedMold) {
            fetchMaxTrays(session, selectedProduct.id, selectedMold.id);
        }
    }, [session, selectedProduct, selectedMold]);

    /* --- Data Fetch --- */
    const fetchData = async () => {
        if (!session) return;

        const products_response: GetAllProductRes = await productRepository.getAll({
            session
        } as GetAllProductReq);
        const products = Product.fromList(products_response.products);
        setProducts(products);

        const molds_response = await moldRepository.getAll({
            session,
        } as GetAllMoldReq);
        const molds = Mold.filterPlanifiable(Mold.fromList(molds_response.molds));
        setMolds(molds);

        const families_response: GetAllMoldFamilyRes = await moldRepository.getAllFamilies({
            session
        });
        const families = MoldFamily.fromList(families_response.moldFamilies);
        setFamilies(families);

        const shifts_response: GetAllShiftRes = await shiftRepository.getAll({
            session
        });
        const shifts = Shift.fromList(shifts_response.shifts);
        setShifts(shifts);
    }

    const fetchMaxTrays = async (session: any, productId: string, moldId: string) => {
        try {
            const response: CalculateMaximumTraysRes = await productionOrderRepository.calculateMaximumTrays({
                session,
                productId,
                moldId,
            } as CalculateMaximumTraysReq);
            setMaxTrays(response);
        }
        catch (error) {
            setMaxTrays(null);
        }
    };

    /* --- Functions --- */
    const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();

            if (!validateForm() || !selectedProduct || !selectedMold || !selectedShift) return;

            setLoading(true);

            await productionOrderRepository.create({
                session,
                productId: selectedProduct.id,
                moldId: selectedMold.id,
                shift: selectedShift.value,
                tunnels: NumbersHandler.parse(formValues.tunnels),
                trays: NumbersHandler.parse(formValues.trays),
                quantity: NumbersHandler.parse(formValues.quantity),
                units: NumbersHandler.parse(formValues.units),
                startDate: DateHandler.parseUTCStartDate(formValues.startDate),
                endDate: DateHandler.parseUTCEndDate(formValues.endDate),
            } as CreateProductionOrderReq);

            toast.success(SuccessMessages.PRODUCTION_ORDER_CREATED);
            navigate('/produccion/ordenes');
        }
        catch (error: any) {
            toast.error(error.message || ErrorMessages.UNKNOWN_ERROR);
        }
        finally {
            setLoading(false);
        }
    }

    const onCancel = () => {
        navigate('/produccion/ordenes');
    }

    return {
        loading,
        user, logout,
        products,
        molds,
        shifts,
        families,
        maxTrays,
        formValues,
        formErrors,
        selectedProduct,
        selectedFamily,
        selectedMold,
        selectedShift,
        onFormChange,
        onCreate,
        onCancel,
    }

}
