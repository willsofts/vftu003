<template>
  <DialogForm ref="dialogForm">
    <template v-slot:header>
      <h4 class="modal-title" v-if="insertMode">{{ labels.title_new }}</h4>
      <h4 class="modal-title" v-if="updateMode">{{ labels.title_edit }}</h4>
    </template>
    <template v-slot:default>
        <div class="row row-height">
          <div class="col-height col-md-7">
            <label for="apiname">{{ labels.apiname_label }}</label>
            <a href="javascript:void(0)" class="info-linker popover-linker">
              <i class="fa fa-info-circle"
                data-toggle="popover"
                data-trigger="click"
                data-content="This is api name to invoke by dataservice/lookup or dataserice/lists. ex. http://localhost:8080/api/dataservice/lookup?apiname=api_name&field=value">
              </i>
            </a>
            <div class="input-group has-validation" :class="{'has-error': v$.apiname.$error}">
              <input type="text" ref="apiname" v-model="localData.apiname" id="apiname" class="form-control input-md" maxlength="50" :disabled="disabledKeyField"/> 
              <label class="required">*</label>
            </div>
            <span v-if="v$.apiname.$error" class="has-error">{{ v$.apiname.$errors[0].$message }}</span>
          </div>
        </div>
        <div class="row row-height">
          <div class="col-height col-md-10">
            <label for="apiquery">{{ labels.apiquery_label }}</label>
            <a href="javascript:void(0)" class="info-linker popover-linker">
              <i class="fa fa-info-circle"
                data-toggle="popover"
                data-trigger="click"
                data-content="This is query statement that can defined parameter with place holder by ? sign ex. select * from table where field=?field">
              </i>
            </a>
            <div class="input-group has-validation" :class="{'has-error': v$.apiquery.$error}">
              <textarea ref="apiquery" v-model="localData.apiquery" id="apiquery" class="form-control input-md" rows="10" /> 
              <label class="required">*</label>
            </div>
            <span v-if="v$.apiquery.$error" class="has-error">{{ v$.apiquery.$errors[0].$message }}</span>
          </div>
        </div>
        <div class="row row-height">
          <div class="col-height col-md-4">
            <label>{{ labels.inactive_label }}</label>
            <div class="input-group has-validation" :class="{'has-error': v$.inactive.$error}">
              <select ref="inactive" v-model="localData.inactive" class="form-control input-md">
                <option v-for="item in dataCategory.tkactive" :key="item.id" :value="item.id">{{item.text}}</option>
              </select>
              <label class="required">*</label>
            </div>
            <span v-if="v$.inactive.$error" class="has-error">{{ v$.inactive.$errors[0].$message }}</span>
          </div>
          <div class="col-height col-md-4">
            <label for="apisection">{{ labels.apisection_label }}</label>
            <a href="javascript:void(0)" class="info-linker popover-linker">
              <i class="fa fa-info-circle"
                data-toggle="popover"
                data-trigger="click"
                data-html="true"
                data-content="This is database connector section defined by configuration setting. see <a href='https://github.com/willsofts/will-sql' target='willsql_window'>will-sql</a>">
              </i>
            </a>
            <input type="text" ref="apisection" v-model="localData.apisection" id="apisection" class="form-control input-md" maxlength="30" /> 
          </div>
        </div>
    </template>
    <template v-slot:footer>
      <button ref="savebutton" id="savebutton" class="btn btn-dark btn-sm" @click="saveClick" v-if="insertMode"><em class="fa fa-save fa-btn-icon"></em>{{ labels.save_button }}</button>
      <button ref="updatebutton" id="updatebutton" class="btn btn-dark btn-sm" @click="updateClick" v-if="updateMode"><em class="fa fa-save fa-btn-icon"></em>{{ labels.update_button }}</button>
      <button id="canceldialogbutton" class="btn btn-dark btn-sm" data-dismiss="modal"><em class="fa fa-close fa-btn-icon"></em>{{ labels.cancel_button }}</button>
    </template>
  </DialogForm>
</template>
<style>
a.popover-linker { margin-left: 5px; }
</style>
<script>
import { ref, computed, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import $ from "jquery";
import { DEFAULT_CONTENT_TYPE, getApiUrl, disableControls }  from '@willsofts/will-app';
import { startWaiting, stopWaiting, submitFailure, detectErrorResponse }  from '@willsofts/will-app';
import { confirmUpdate, confirmSave, confirmDelete, successbox, serializeParameters } from '@willsofts/will-app';
import DialogForm from './DialogForm.vue';

const APP_URL = "/api/sftu003";
const defaultData = {
  apiname: "",
  apiquery: "",
  apisection: "",
  inactive: "0",
};

export default {
  components: {
    DialogForm
  },
  props: {
    modes: Object,
    labels: Object,
    dataCategory: Object
  },
  emits: ["data-saved","data-updated","data-deleted"],
  setup(props) {
    const mode = ref({action: "new", ...props.modes});
    const localData = ref({ ...defaultData }); 
    const disabledKeyField = ref(false);
    const reqalert = ref(props.labels.empty_alert);
    const requiredMessage = () => {
      return helpers.withMessage(reqalert, required);
    }
    const validateRules = computed(() => { 
      return {
        apiname: { required: requiredMessage() },
        apiquery: { required: requiredMessage() },
        inactive: { required: requiredMessage() },
      } 
    });
    const v$ = useVuelidate(validateRules, localData, { $lazy: true, $autoDirty: true });
    return { mode, v$, localData, disabledKeyField, reqalert };
  },
  created() {
    watch(this.$props, (newProps) => {      
      this.reqalert = newProps.labels.empty_alert;
    });
  },
  computed: {
    insertMode() {
      return this.mode.action=="insert" || this.mode.action=="new";
    },
    updateMode() {
      return this.mode.action=="update" || this.mode.action=="edit";
    },
  },
  mounted() {
    this.$nextTick(function () {
      $("#modaldialog_layer").find(".modal-dialog").draggable();
      $('[data-toggle="popover"]').popover();
    });
  },
  methods: {
    reset(newData,newMode) {
      if(newData) this.localData = {...newData};
      if(newMode) this.mode = {...newMode};
    },
    submit() {      
      this.$emit('update:formData', this.localData);
    },
    async saveClick() {
      console.log("click: save");
      disableControls($("#savebutton"));
      let valid = await this.validateForm();
      if(!valid) return;
      this.startSaveRecord();
    },
    async updateClick() {
      console.log("click: update");
      disableControls($("#updatebutton"));
      let valid = await this.validateForm();
      if(!valid) return;
      this.startUpdateRecord();
    },
    async validateForm(focusing=true) {
      const valid = await this.v$.$validate();
      console.log("validate form: valid",valid);
      console.log("error:",this.v$.$errors);
      if(!valid) {
        if(focusing) {
          this.focusFirstError();
        }
        return false;
      }
      return true;
    },
    focusFirstError() {
      if(this.v$.$errors && this.v$.$errors.length > 0) {
        let input = this.v$.$errors[0].$property;
        let el = this.$refs[input];
        if(el) el.focus(); //if using ref
        else $("#"+input).trigger("focus"); //if using id
      }
    },
    showDialog(callback) {
      //$("#modaldialog_layer").modal("show");
      if(callback) $(this.$refs.dialogForm.$el).on("shown.bs.modal",callback);
      $(this.$refs.dialogForm.$el).modal("show");
    },  
    hideDialog() {
      //$("#modaldialog_layer").modal("hide");
      $(this.$refs.dialogForm.$el).modal("hide");
    },
    resetRecord() {
      //reset to default data 
      this.reset(defaultData,{action:"insert"});
      //reset validator
      this.v$.$reset();
      //enable key field
      this.disabledKeyField = false;
    },
    startInsertRecord() {
      this.resetRecord();
      this.showDialog(() => { this.$refs.apiname.focus(); });
    },
    startSaveRecord() {
      confirmSave(() => {
        this.saveRecord(this.localData);
      });
    },
    startUpdateRecord() {
      confirmUpdate(() => { 
        this.updateRecord(this.localData);
      });
    },
    startDeleteRecord(dataKeys) {
      confirmDelete(Object.values(dataKeys),() => {
        this.deleteRecord(dataKeys);
      });
    },
    saveRecord(dataRecord) {
        let jsondata = {ajax: true};
        let formdata = serializeParameters(jsondata,dataRecord);
        startWaiting();
        $.ajax({
          url: getApiUrl()+APP_URL+"/insert",
          data: formdata.jsondata,
          headers : formdata.headers,
          type: "POST",
          dataType: "json",
          contentType: DEFAULT_CONTENT_TYPE,
          error : function(transport,status,errorThrown) {
            console.error("error: status",status,"errorThrown",errorThrown);
            submitFailure(transport,status,errorThrown);
          },
          success: (data) => {
            stopWaiting();
            console.log("success",data);
            if(detectErrorResponse(data)) return;
            successbox(() => {
              //reset data for new record insert
              this.resetRecord();
              setTimeout(() => { this.$refs.apiname.focus(); },100);
              this.$emit('data-saved',dataRecord,data);
            });
          }
      });
    },
    updateRecord(dataRecord) {
        let jsondata = {ajax: true};
        let formdata = serializeParameters(jsondata,dataRecord);
        startWaiting();
        $.ajax({
          url: getApiUrl()+APP_URL+"/update",
          data: formdata.jsondata,
          headers : formdata.headers,
          type: "POST",
          dataType: "json",
          contentType: DEFAULT_CONTENT_TYPE,
          error : function(transport,status,errorThrown) {
            console.error("error: status",status,"errorThrown",errorThrown);
            submitFailure(transport,status,errorThrown);
          },
          success: (data) => {
            stopWaiting();
            console.log("success",data);
            if(detectErrorResponse(data)) return;
            successbox(() => {
              this.hideDialog();
              this.$emit('data-updated',dataRecord,data);
            });
          }
      });
    },
    retrieveRecord(dataKeys) {
      let jsondata = {ajax: true};
      let formdata = serializeParameters(jsondata,dataKeys);
      startWaiting();
      $.ajax({
        url: getApiUrl()+APP_URL+"/retrieve",
        data: formdata.jsondata,
        headers : formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: DEFAULT_CONTENT_TYPE,
        error : function(transport,status,errorThrown) {
          console.error("retrieveRecord: error: status",status,"errorThrown",errorThrown);
          submitFailure(transport,status,errorThrown);
        },
        success: (data) => {
          stopWaiting();
          console.log("retrieveRecord: success",data);
          if(data.body.dataset) {
            this.reset(data.body.dataset,{action:"edit"});
            this.v$.$reset();
            this.disabledKeyField = true;
            this.showDialog(() => { this.$refs.apiquery.focus(); });
          }
        }
      });	
    },
    deleteRecord(dataKeys) {
      let jsondata = {ajax: true};
      let formdata = serializeParameters(jsondata,dataKeys);
      startWaiting();
      $.ajax({
        url: getApiUrl()+APP_URL+"/remove",
        data: formdata.jsondata,
        headers : formdata.headers,
        type: "POST",
        dataType: "json",
        contentType: DEFAULT_CONTENT_TYPE,
        error : function(transport,status,errorThrown) {
          console.error("deleteRecord: error: status",status,"errorThrown",errorThrown);
          submitFailure(transport,status,errorThrown);
        },
        success: (data) => {
          stopWaiting();
          console.log("deleteRecord: success",data);
          if(detectErrorResponse(data)) return;
          successbox(() => {
            this.$emit('data-deleted',dataKeys,data);
          });
        }
      });	
    },
  }
};
</script>
