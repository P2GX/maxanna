
use std::sync::Arc;

use ontolius::{TermId, io::OntologyLoaderBuilder, ontology::{HierarchyWalks, MetadataAware, OntologyTerms, csr::FullCsrOntology}, term::{MinimalTerm}};


pub struct MaxAnnaSingleton {
  // settings: HpoCuratorSettings,
    /// Human Phenotype Ontology
    hpo: Option<Arc<FullCsrOntology>>,
    maxo:  Option<Arc<FullCsrOntology>>,
}


impl MaxAnnaSingleton {
    /// Create a new instance of PhenoboardSingleton
    /// 
    /// The constructor will try to load the HPO from the settings file if available;
    /// if something does not work, it will leave the ontology field as None
    pub fn new() -> Self {
        let mut singleton = MaxAnnaSingleton::default();
        return singleton;
    }


    pub fn set_hpo(&mut self, ontology: Arc<FullCsrOntology>, hpo_json_path: &str) {
        self.hpo = Some(ontology.clone());
      //  let _ = self.settings.set_hp_json_path(hpo_json_path);
    }

    pub fn get_hpo(&self) -> Option<Arc<FullCsrOntology>> {
        match &self.hpo {
            Some(hpo) => Some(hpo.clone()),
            None => None,
        }
    }



    pub fn set_maxo(&mut self, ontology: Arc<FullCsrOntology>, maxo_json_path: &str) {
        self.maxo = Some(ontology.clone());
       // self.autocompleter = Some(AutoCompleter::new(ontology.clone()));
        //let _ = self.settings.set_hp_json_path(hpo_json_path);
    }

    pub fn get_maxo(&self) -> Option<Arc<FullCsrOntology>> {
        match &self.maxo {
            Some(maxo) => Some(maxo.clone()),
            None => None,
        }
    }

}



impl Default for MaxAnnaSingleton {
    fn default() -> Self {
        Self { 
           hpo: None,
           maxo: None,
        }
    }
}