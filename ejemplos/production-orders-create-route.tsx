import BigTitle from "../../components/big-title/big-title";
import Loading from "../../components/loading/loading";
import Layout from "../../layout/layout";
import ViewModel from "./viewmodel";
import ProductionOrderForm from "../../components/production-order-form/production-order-form";

export default function ProductionOrdersCreateRoute() {

    const {
        loading,
        user, logout,
        products,
        molds,
        families,
        shifts,
        formValues,
        formErrors,
        onCreate,
        onCancel,
        onFormChange,
        maxTrays,
        selectedFamily,
        selectedMold,
    } = ViewModel();

    if (loading) {
        return <Loading />
    }

    return (
        <Layout withHeader username={user?.username} onLogout={logout}>
            <section className="default_section_panel">
                <BigTitle text="Crear orden de producción" />
                <ProductionOrderForm
                    productionOrder={undefined}
                    products={products}
                    molds={molds}
                    families={families}
                    shifts={shifts}
                    formValues={formValues}
                    formErrors={formErrors}
                    onSubmit={onCreate}
                    onCancel={onCancel}
                    onFormChange={onFormChange}
                    maxTrays={maxTrays}
                    selectedFamily={selectedFamily}
                    selectedMold={selectedMold}
                />
            </section>
        </Layout>
    )
}
