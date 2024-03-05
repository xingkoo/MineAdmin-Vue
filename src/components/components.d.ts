import MaTable from './ma-table/index.vue';
import MaCrud from './ma-crud/index.vue';
import MaForm from './ma-form/index.vue';
import MaChart from './ma-charts/index.vue';
import MaUpload from './ma-upload/index.vue';
import MaTreeSlider from './ma-treeSlider/index.vue';
import MaResource from './ma-resource/index.vue';
import MaResourceButton from './ma-resource/button.vue';
import MaUser from './ma-user/index.vue';
import MaEditor from './ma-editor/index.vue';
import MaWangEditor from './ma-wangEditor/index.vue';
import MaIcon from './ma-icon/index.vue';
import MaCodeEditor from './ma-codeEditor/index.vue';
import MaUserInfo from './ma-userInfo/index.vue';
import MaCityLinkage from './ma-cityLinkage/index.vue';
declare module 'vue' {
  export interface GlobalComponents {
    MaTable: typeof MaTable;
    MaCrud: typeof MaCrud;
    MaForm: typeof MaForm;
    MaChart: typeof MaChart;
    MaUpload: typeof MaUpload;
    MaTreeSlider: typeof MaTreeSlider;
    MaResource: typeof MaResource;
    MaResourceButton: typeof MaResourceButton;
    MaUser: typeof MaUser;
    MaEditor: typeof MaEditor;
    MaWangEditor: typeof MaWangEditor;
    MaIcon: typeof MaIcon;
    MaCodeEditor: typeof MaCodeEditor;
    MaUserInfo: typeof MaUserInfo;
    MaCityLinkage: typeof MaCityLinkage;
  }
}
