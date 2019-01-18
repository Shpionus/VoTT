import createMockStore, { MockStoreEnhanced } from "redux-mock-store";
import { ActionTypes } from "./actionTypes";
import * as projectActions from "./projectActions";
import MockFactory from "../../common/mockFactory";
import thunk from "redux-thunk";

jest.mock("../../services/projectService");
import ProjectService from "../../services/projectService";

jest.mock("../../services/assetService");
import { AssetService } from "../../services/assetService";
import { ExportProviderFactory } from "../../providers/export/exportProviderFactory";
import { IExportProvider } from "../../providers/export/exportProvider";

describe("Project Redux Actions", () => {
    let store: MockStoreEnhanced;

    beforeEach(() => {
        const middleware = [thunk];
        store = createMockStore(middleware)();
    });
    it("Load Project action resolves a promise and dispatches redux action", async () => {
        const project = MockFactory.createTestProject("Project1");
        const result = await projectActions.loadProject(project)(store.dispatch);
        const actions = store.getActions();

        expect(actions.length).toEqual(1);
        expect(actions[0]).toEqual({
            type: ActionTypes.LOAD_PROJECT_SUCCESS,
            payload: project,
        });
        expect(result).toEqual(project);
    });

    it("Save Project action calls project service and dispatches redux action", async () => {
        const projectServiceMock = ProjectService as jest.Mocked<typeof ProjectService>;
        projectServiceMock.prototype.save = jest.fn((project) => Promise.resolve(project));

        const project = MockFactory.createTestProject("Project1");
        const result = await projectActions.saveProject(project)(store.dispatch, store.getState);
        const actions = store.getActions();

        expect(actions.length).toEqual(1);
        expect(actions[0]).toEqual({
            type: ActionTypes.SAVE_PROJECT_SUCCESS,
            payload: project,
        });
        expect(result).toEqual(project);
        expect(projectServiceMock.prototype.save).toBeCalledWith(project);
    });

    it("Delete Project action calls project service and dispatches redux action", async () => {
        const projectServiceMock = ProjectService as jest.Mocked<typeof ProjectService>;
        projectServiceMock.prototype.delete = jest.fn(() => Promise.resolve());

        const project = MockFactory.createTestProject("Project1");
        await projectActions.deleteProject(project)(store.dispatch);
        const actions = store.getActions();

        expect(actions.length).toEqual(1);
        expect(actions[0]).toEqual({
            type: ActionTypes.DELETE_PROJECT_SUCCESS,
            payload: project,
        });
        expect(projectServiceMock.prototype.delete).toBeCalledWith(project);
    });

    it("Close project dispatches redux action", () => {
        projectActions.closeProject()(store.dispatch);
        const actions = store.getActions();

        expect(actions.length).toEqual(1);
        expect(actions[0]).toEqual({
            type: ActionTypes.CLOSE_PROJECT_SUCCESS,
        });
    });

    it("Load Assets calls asset service and dispatches redux action", async () => {
        const testAssets = MockFactory.createTestAssets(10);
        const mockAssetService = AssetService as jest.Mocked<typeof AssetService>;
        mockAssetService.prototype.getAssets = jest.fn(() => Promise.resolve(testAssets));

        const project = MockFactory.createTestProject("Project1");
        const results = await projectActions.loadAssets(project)(store.dispatch);
        const actions = store.getActions();

        expect(actions.length).toEqual(1);
        expect(actions[0]).toEqual({
            type: ActionTypes.LOAD_PROJECT_ASSETS_SUCCESS,
            payload: testAssets,
        });

        expect(mockAssetService.prototype.getAssets).toBeCalled();
        expect(results).toEqual(testAssets);
    });

    it("Load Asset metadata calls asset service and dispatches redux action", async () => {
        const asset = MockFactory.createTestAsset("Asset1");
        const assetMetadata = MockFactory.createTestAssetMetadata(asset);
        const mockAssetService = AssetService as jest.Mocked<typeof AssetService>;
        mockAssetService.prototype.getAssetMetadata = jest.fn(() => assetMetadata);

        const project = MockFactory.createTestProject("Project1");
        const result = await projectActions.loadAssetMetadata(project, asset)(store.dispatch);
        const actions = store.getActions();

        expect(actions.length).toEqual(1);
        expect(actions[0]).toEqual({
            type: ActionTypes.LOAD_ASSET_METADATA_SUCCESS,
            payload: assetMetadata,
        });

        expect(mockAssetService.prototype.getAssetMetadata).toBeCalledWith(asset);
        expect(result).toEqual(assetMetadata);
    });

    it("Save Asset metadata calls asset service and dispatches redux action", async () => {
        const asset = MockFactory.createTestAsset("Asset1");
        const assetMetadata = MockFactory.createTestAssetMetadata(asset);
        const mockAssetService = AssetService as jest.Mocked<typeof AssetService>;
        mockAssetService.prototype.save = jest.fn(() => assetMetadata);

        const project = MockFactory.createTestProject("Project1");
        const result = await projectActions.saveAssetMetadata(project, assetMetadata)(store.dispatch);
        const actions = store.getActions();

        expect(actions.length).toEqual(1);
        expect(actions[0]).toEqual({
            type: ActionTypes.SAVE_ASSET_METADATA_SUCCESS,
            payload: assetMetadata,
        });

        expect(mockAssetService.prototype.save).toBeCalledWith(assetMetadata);
        expect(result).toEqual(assetMetadata);
    });

    it("Export project calls export provider and dispatches redux action", async () => {
        const mockExportProvider: IExportProvider = {
            project: null,
            export: jest.fn(() => Promise.resolve()),
        };
        ExportProviderFactory.create = jest.fn(() => mockExportProvider);

        const project = MockFactory.createTestProject("Project1");
        await projectActions.exportProject(project)(store.dispatch);
        const actions = store.getActions();

        expect(actions.length).toEqual(1);
        expect(actions[0]).toEqual({
            type: ActionTypes.EXPORT_PROJECT_SUCCESS,
            payload: project,
        });

        expect(ExportProviderFactory.create).toBeCalledWith(
            project.exportFormat.providerType,
            project,
            project.exportFormat.providerOptions,
        );

        expect(mockExportProvider.export).toHaveBeenCalled();
    });
});