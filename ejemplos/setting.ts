import { SettingDataSourceI } from "@/domain/datasources/setting";
import { SettingRepositoryI } from "@/domain/repositories/setting";
import { GetSettingsReq } from "@/domain/dto/setting/request/GetSettingsReq";
import { GetSettingsRes } from "@/domain/dto/setting/response/GetSettingsRes";
import { UpdateSettingsReq } from "@/domain/dto/setting/request/UpdateSettingsReq";
import { UpdateSettingsRes } from "@/domain/dto/setting/response/UpdateSettingsRes";

export class SettingRepository implements SettingRepositoryI {

    private readonly dataSource: SettingDataSourceI;

    constructor(dataSource: SettingDataSourceI) {
        this.dataSource = dataSource;
    }

    public async getSettings(dto: GetSettingsReq): Promise<GetSettingsRes> {
        return await this.dataSource.getSettings(dto);
    }

    public async updateSettings(dto: UpdateSettingsReq): Promise<UpdateSettingsRes> {
        return await this.dataSource.updateSettings(dto);
    }
}
