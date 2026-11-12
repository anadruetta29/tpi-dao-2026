import { CategoryDataSourceI } from "../../../domain/datasources/category";
import { Category } from "../../../domain/entities/category";
import { CategoryFilters } from "../../../domain/filters/category-filters";
import { CreateCategoryReq } from "../../../domain/dto/category/request/CreateCategoryReq";
import { CreateCategoryRes } from "../../../domain/dto/category/response/CreateCategoryRes";
import { UpdateCategoryReq } from "../../../domain/dto/category/request/UpdateCategoryReq";
import { UpdateCategoryRes } from "../../../domain/dto/category/response/UpdateCategoryRes";
import { DeleteCategoryReq } from "../../../domain/dto/category/request/DeleteCategoryReq";
import { GetCategoryByIdReq } from "../../../domain/dto/category/request/GetCategoryByIdReq";
import { GetCategoryByIdRes } from "../../../domain/dto/category/response/GetCategoryByIdRes";
import { GetAllCategoriesReq } from "../../../domain/dto/category/request/GetAllCategoriesReq";
import { GetAllCategoriesRes } from "../../../domain/dto/category/response/GetAllCategoriesRes";
import { HTTPClient } from "../../../core/adapters/http-client";
import { CacheTags, withCacheTags } from "../../../core/config/cache";
import { ErrorHandler } from "@/domain/messages";

export class CategoryApiDataSource implements CategoryDataSourceI {

    private readonly httpClient: HTTPClient;

    constructor() {
        this.httpClient = new HTTPClient();
    }

    public async getAllCategories(dto: GetAllCategoriesReq): Promise<GetAllCategoriesRes> {
        try {
            const filters = dto.filters ?? CategoryFilters.fromObject(dto);
            const params = filters.toApiParams();

            const response = await this.httpClient.get(
                "/api/categories/all",
                params,
                dto.session?.accessToken,
                withCacheTags(CacheTags.BACKOFFICE_CATEGORIES)
            );
            const list = response?.categories || response || [];
            return {
                categories: Category.fromList(list),
                total: response?.totalElements ?? response?.total ?? list.length ?? 0,
                totalPages: response?.totalPages ?? 1,
                currentPage: response?.currentPage ?? 0,
                pageSize: response?.pageSize ?? list.length
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async getCategoryById(dto: GetCategoryByIdReq): Promise<GetCategoryByIdRes> {
        try {
            const response = await this.httpClient.get(
                `/api/categories/detail?id=${dto.id}`,
                {},
                dto.session?.accessToken,
                withCacheTags(CacheTags.BACKOFFICE_CATEGORIES, CacheTags.backofficeCategoryDetail(dto.id))
            );
            return {
                category: Category.fromObject(response?.category || response)!
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async createCategory(dto: CreateCategoryReq): Promise<CreateCategoryRes> {
        try {
            const response = await this.httpClient.post("/api/categories", {
                name: dto.name,
                slug: dto.slug,
                image: dto.image,
                subcategoryIds: dto.subcategoryIds || []
            }, dto.session.accessToken);

            return {
                id: response?.id || response?.category?.id
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async updateCategory(dto: UpdateCategoryReq): Promise<UpdateCategoryRes> {
        try {
            const response = await this.httpClient.put(`/api/categories?id=${dto.id}`, {
                name: dto.name,
                slug: dto.slug,
                image: dto.image,
                subcategoryIds: dto.subcategoryIds || []
            }, dto.session.accessToken);

            return {
                id: response?.id || response?.category?.id || dto.id
            };
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

    public async deleteCategory(dto: DeleteCategoryReq): Promise<void> {
        try {
            await this.httpClient.delete(`/api/categories?id=${dto.id}`, {}, dto.session.accessToken);
        }
        catch (error: any) {
            throw ErrorHandler.handleError(error);
        }
    }

}
