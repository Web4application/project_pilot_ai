# Configuration

The base class [PreTrainedConfig](/docs/transformers/main/en/main_classes/configuration#transformers.PreTrainedConfig) implements the common methods for loading/saving a configuration
either from a local file or directory, or from a pretrained model configuration provided by the library (downloaded
from HuggingFace's AWS S3 repository).

Each derived config class implements model specific attributes. Common attributes present in all config classes are:
`hidden_size`, `num_attention_heads`, and `num_hidden_layers`. Text models further implement:
`vocab_size`.

## PreTrainedConfig[[transformers.PreTrainedConfig]]

<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>class transformers.PreTrainedConfig</name><anchor>transformers.PreTrainedConfig</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L53</source><parameters>[{"name": "output_hidden_states", "val": ": bool = False"}, {"name": "output_attentions", "val": ": bool = False"}, {"name": "return_dict", "val": ": bool = True"}, {"name": "torchscript", "val": ": bool = False"}, {"name": "dtype", "val": ": typing.Union[str, ForwardRef('torch.dtype'), NoneType] = None"}, {"name": "tie_word_embeddings", "val": ": bool = True"}, {"name": "chunk_size_feed_forward", "val": ": int = 0"}, {"name": "is_encoder_decoder", "val": ": bool = False"}, {"name": "is_decoder", "val": ": bool = False"}, {"name": "cross_attention_hidden_size", "val": ": typing.Optional[int] = None"}, {"name": "add_cross_attention", "val": ": bool = False"}, {"name": "tie_encoder_decoder", "val": ": bool = False"}, {"name": "architectures", "val": ": typing.Optional[list[str]] = None"}, {"name": "finetuning_task", "val": ": typing.Optional[str] = None"}, {"name": "id2label", "val": ": typing.Optional[dict[int, str]] = None"}, {"name": "label2id", "val": ": typing.Optional[dict[str, int]] = None"}, {"name": "num_labels", "val": ": typing.Optional[int] = None"}, {"name": "task_specific_params", "val": ": typing.Optional[dict[str, typing.Any]] = None"}, {"name": "problem_type", "val": ": typing.Optional[str] = None"}, {"name": "tokenizer_class", "val": ": typing.Optional[str] = None"}, {"name": "prefix", "val": ": typing.Optional[str] = None"}, {"name": "bos_token_id", "val": ": typing.Optional[int] = None"}, {"name": "pad_token_id", "val": ": typing.Optional[int] = None"}, {"name": "eos_token_id", "val": ": typing.Optional[int] = None"}, {"name": "sep_token_id", "val": ": typing.Optional[int] = None"}, {"name": "decoder_start_token_id", "val": ": typing.Optional[int] = None"}, {"name": "**kwargs", "val": ""}]</parameters><paramsdesc>- **name_or_path** (`str`, *optional*, defaults to `""`) --
  Store the string that was passed to [PreTrainedModel.from_pretrained()](/docs/transformers/main/en/main_classes/model#transformers.PreTrainedModel.from_pretrained) as `pretrained_model_name_or_path`
  if the configuration was created with such a method.
- **output_hidden_states** (`bool`, *optional*, defaults to `False`) --
  Whether or not the model should return all hidden-states.
- **output_attentions** (`bool`, *optional*, defaults to `False`) --
  Whether or not the model should returns all attentions.
- **return_dict** (`bool`, *optional*, defaults to `True`) --
  Whether or not the model should return a [ModelOutput](/docs/transformers/main/en/main_classes/output#transformers.utils.ModelOutput) instead of a plain tuple.
- **is_encoder_decoder** (`bool`, *optional*, defaults to `False`) --
  Whether the model is used as an encoder/decoder or not.
- **is_decoder** (`bool`, *optional*, defaults to `False`) --
  Whether to only use the decoder in an encoder-decoder architecture, otherwise it has no effect on
  decoder-only or encoder-only architectures.
- **cross_attention_hidden_size** (`bool`, *optional*) --
  The hidden size of the cross-attention layer in case the model is used as a decoder in an encoder-decoder
  setting and the cross-attention hidden dimension differs from `self.config.hidden_size`.
- **add_cross_attention** (`bool`, *optional*, defaults to `False`) --
  Whether cross-attention layers should be added to the model. Note, this option is only relevant for models
  that can be used as decoder models within the [EncoderDecoderModel](/docs/transformers/main/en/model_doc/encoder-decoder#transformers.EncoderDecoderModel) class, which consists of all models
  in `AUTO_MODELS_FOR_CAUSAL_LM`.
- **tie_encoder_decoder** (`bool`, *optional*, defaults to `False`) --
  Whether all encoder weights should be tied to their equivalent decoder weights. This requires the encoder
  and decoder model to have the exact same parameter names.
- **chunk_size_feed_forward** (`int`, *optional*, defaults to `0`) --
  The chunk size of all feed forward layers in the residual attention blocks. A chunk size of `0` means that
  the feed forward layer is not chunked. A chunk size of n means that the feed forward layer processes `n` <
  sequence_length embeddings at a time. For more information on feed forward chunking, see [How does Feed
  Forward Chunking work?](../glossary.html#feed-forward-chunking).

</paramsdesc><paramsdesc1title>Parameters for fine-tuning tasks</paramsdesc1title><paramsdesc1>

- **architectures** (`list[str]`, *optional*) --
  Model architectures that can be used with the model pretrained weights.
- **finetuning_task** (`str`, *optional*) --
  Name of the task used to fine-tune the model.
- **id2label** (`dict[int, str]`, *optional*) --
  A map from index (for instance prediction index, or target index) to label.
- **label2id** (`dict[str, int]`, *optional*) --
  A map from label to index for the model.
- **num_labels** (`int`, *optional*) --
  Number of labels to use in the last layer added to the model, typically for a classification task.
- **task_specific_params** (`dict[str, Any]`, *optional*) --
  Additional keyword arguments to store for the current task.
- **problem_type** (`str`, *optional*) --
  Problem type for `XxxForSequenceClassification` models. Can be one of `"regression"`,
  `"single_label_classification"` or `"multi_label_classification"`.

</paramsdesc1><paramsdesc2title>Parameters linked to the tokenizer</paramsdesc2title><paramsdesc2>

- **tokenizer_class** (`str`, *optional*) --
  The name of the associated tokenizer class to use (if none is set, will use the tokenizer associated to the
  model by default).
- **prefix** (`str`, *optional*) --
  A specific prompt that should be added at the beginning of each text before calling the model.
- **bos_token_id** (`int`, *optional*) --
  The id of the _beginning-of-stream_ token.
- **pad_token_id** (`int`, *optional*) --
  The id of the _padding_ token.
- **eos_token_id** (`int`, *optional*) --
  The id of the _end-of-stream_ token.
- **decoder_start_token_id** (`int`, *optional*) --
  If an encoder-decoder model starts decoding with a different token than _bos_, the id of that token.
- **sep_token_id** (`int`, *optional*) --
  The id of the _separation_ token.

</paramsdesc2><paramsdesc3title>PyTorch specific parameters</paramsdesc3title><paramsdesc3>

- **torchscript** (`bool`, *optional*, defaults to `False`) --
  Whether or not the model should be used with Torchscript.
- **tie_word_embeddings** (`bool`, *optional*, defaults to `True`) --
  Whether the model's input and output word embeddings should be tied. Note that this is only relevant if the
  model has a output word embedding layer.
- **dtype** (`str`, *optional*) --
  The `dtype` of the weights. This attribute can be used to initialize the model to a non-default `dtype`
  (which is normally `float32`) and thus allow for optimal storage allocation. For example, if the saved
  model is `float16`, ideally we want to load it back using the minimal amount of memory needed to load
  `float16` weights.</paramsdesc3><paramgroups>3</paramgroups></docstring>

Base class for all configuration classes. Handles a few parameters common to all models' configurations as well as
methods for loading/downloading/saving configurations.

<Tip>

A configuration file can be loaded and saved to disk. Loading the configuration file and using this file to
initialize a model does **not** load the model weights. It only affects the model's configuration.

</Tip>

Class attributes (overridden by derived classes):

- **model_type** (`str`) -- An identifier for the model type, serialized into the JSON file, and used to recreate
  the correct object in [AutoConfig](/docs/transformers/main/en/model_doc/auto#transformers.AutoConfig).
- **has_no_defaults_at_init** (`bool`) -- Whether the config class can be initialized without providing input arguments.
  Some configurations requires inputs to be defined at init and have no default values, usually these are composite configs,
  (but not necessarily) such as [EncoderDecoderConfig](/docs/transformers/main/en/model_doc/encoder-decoder#transformers.EncoderDecoderConfig) or [~RagConfig](/docs/transformers/main/en/model_doc/rag#transformers.RagConfig). They have to be initialized from
  two or more configs of type [PreTrainedConfig](/docs/transformers/main/en/main_classes/configuration#transformers.PreTrainedConfig).
- **keys_to_ignore_at_inference** (`list[str]`) -- A list of keys to ignore by default when looking at dictionary
  outputs of the model during inference.
- **attribute_map** (`dict[str, str]`) -- A dict that maps model specific attribute names to the standardized
  naming of attributes.
- **base_model_tp_plan** (`dict[str, Any]`) -- A dict that maps sub-modules FQNs of a base model to a tensor
  parallel plan applied to the sub-module when `model.tensor_parallel` is called.
- **base_model_pp_plan** (`dict[str, tuple[list[str]]]`) -- A dict that maps child-modules of a base model to a
  pipeline parallel plan that enables users to place the child-module on the appropriate device.

Common attributes (present in all subclasses):

- **vocab_size** (`int`) -- The number of tokens in the vocabulary, which is also the first dimension of the
  embeddings matrix (this attribute may be missing for models that don't have a text modality like ViT).
- **hidden_size** (`int`) -- The hidden size of the model.
- **num_attention_heads** (`int`) -- The number of attention heads used in the multi-head attention layers of the
  model.
- **num_hidden_layers** (`int`) -- The number of blocks in the model.

<Tip warning={true}>

Setting parameters for sequence generation in the model config is deprecated. For backward compatibility, loading
some of them will still be possible, but attempting to overwrite them will throw an exception -- you should set
them in a [~transformers.GenerationConfig]. Check the documentation of [~transformers.GenerationConfig] for more
information about the individual parameters.

</Tip>





<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>push_to_hub</name><anchor>transformers.PreTrainedConfig.push_to_hub</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/utils/hub.py#L829</source><parameters>[{"name": "repo_id", "val": ": str"}, {"name": "use_temp_dir", "val": ": typing.Optional[bool] = None"}, {"name": "commit_message", "val": ": typing.Optional[str] = None"}, {"name": "private", "val": ": typing.Optional[bool] = None"}, {"name": "token", "val": ": typing.Union[bool, str, NoneType] = None"}, {"name": "max_shard_size", "val": ": typing.Union[str, int, NoneType] = '5GB'"}, {"name": "create_pr", "val": ": bool = False"}, {"name": "safe_serialization", "val": ": bool = True"}, {"name": "revision", "val": ": typing.Optional[str] = None"}, {"name": "commit_description", "val": ": typing.Optional[str] = None"}, {"name": "tags", "val": ": typing.Optional[list[str]] = None"}, {"name": "**deprecated_kwargs", "val": ""}]</parameters><paramsdesc>- **repo_id** (`str`) --
  The name of the repository you want to push your config to. It should contain your organization name
  when pushing to a given organization.
- **use_temp_dir** (`bool`, *optional*) --
  Whether or not to use a temporary directory to store the files saved before they are pushed to the Hub.
  Will default to `True` if there is no directory named like `repo_id`, `False` otherwise.
- **commit_message** (`str`, *optional*) --
  Message to commit while pushing. Will default to `"Upload config"`.
- **private** (`bool`, *optional*) --
  Whether to make the repo private. If `None` (default), the repo will be public unless the organization's default is private. This value is ignored if the repo already exists.
- **token** (`bool` or `str`, *optional*) --
  The token to use as HTTP bearer authorization for remote files. If `True`, will use the token generated
  when running `hf auth login` (stored in `~/.huggingface`). Will default to `True` if `repo_url`
  is not specified.
- **max_shard_size** (`int` or `str`, *optional*, defaults to `"5GB"`) --
  Only applicable for models. The maximum size for a checkpoint before being sharded. Checkpoints shard
  will then be each of size lower than this size. If expressed as a string, needs to be digits followed
  by a unit (like `"5MB"`). We default it to `"5GB"` so that users can easily load models on free-tier
  Google Colab instances without any CPU OOM issues.
- **create_pr** (`bool`, *optional*, defaults to `False`) --
  Whether or not to create a PR with the uploaded files or directly commit.
- **safe_serialization** (`bool`, *optional*, defaults to `True`) --
  Whether or not to convert the model weights in safetensors format for safer serialization.
- **revision** (`str`, *optional*) --
  Branch to push the uploaded files to.
- **commit_description** (`str`, *optional*) --
  The description of the commit that will be created
- **tags** (`list[str]`, *optional*) --
  List of tags to push on the Hub.</paramsdesc><paramgroups>0</paramgroups></docstring>

Upload the configuration file to the 🤗 Model Hub.



<ExampleCodeBlock anchor="transformers.PreTrainedConfig.push_to_hub.example">

Examples:

```python
from transformers import AutoConfig

config = AutoConfig.from_pretrained("google-bert/bert-base-cased")

# Push the config to your namespace with the name "my-finetuned-bert".
config.push_to_hub("my-finetuned-bert")

# Push the config to an organization with the name "my-finetuned-bert".
config.push_to_hub("huggingface/my-finetuned-bert")
```

</ExampleCodeBlock>


</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>dict_dtype_to_str</name><anchor>transformers.PreTrainedConfig.dict_dtype_to_str</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L1030</source><parameters>[{"name": "d", "val": ": dict"}]</parameters></docstring>

Checks whether the passed dictionary and its nested dicts have a *dtype* key and if it's not None,
converts torch.dtype to a string of just the type. For example, `torch.float32` get converted into *"float32"*
string, which can then be stored in the json format.


</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>from_dict</name><anchor>transformers.PreTrainedConfig.from_dict</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L755</source><parameters>[{"name": "config_dict", "val": ": dict"}, {"name": "**kwargs", "val": ""}]</parameters><paramsdesc>- **config_dict** (`dict[str, Any]`) --
  Dictionary that will be used to instantiate the configuration object. Such a dictionary can be
  retrieved from a pretrained checkpoint by leveraging the [get_config_dict()](/docs/transformers/main/en/main_classes/configuration#transformers.PreTrainedConfig.get_config_dict) method.
- **kwargs** (`dict[str, Any]`) --
  Additional parameters from which to initialize the configuration object.</paramsdesc><paramgroups>0</paramgroups><rettype>[PreTrainedConfig](/docs/transformers/main/en/main_classes/configuration#transformers.PreTrainedConfig)</rettype><retdesc>The configuration object instantiated from those parameters.</retdesc></docstring>

Instantiates a [PreTrainedConfig](/docs/transformers/main/en/main_classes/configuration#transformers.PreTrainedConfig) from a Python dictionary of parameters.








</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>from_json_file</name><anchor>transformers.PreTrainedConfig.from_json_file</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L824</source><parameters>[{"name": "json_file", "val": ": typing.Union[str, os.PathLike]"}]</parameters><paramsdesc>- **json_file** (`str` or `os.PathLike`) --
  Path to the JSON file containing the parameters.</paramsdesc><paramgroups>0</paramgroups><rettype>[PreTrainedConfig](/docs/transformers/main/en/main_classes/configuration#transformers.PreTrainedConfig)</rettype><retdesc>The configuration object instantiated from that JSON file.</retdesc></docstring>

Instantiates a [PreTrainedConfig](/docs/transformers/main/en/main_classes/configuration#transformers.PreTrainedConfig) from the path to a JSON file of parameters.








</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>from_pretrained</name><anchor>transformers.PreTrainedConfig.from_pretrained</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L516</source><parameters>[{"name": "pretrained_model_name_or_path", "val": ": typing.Union[str, os.PathLike]"}, {"name": "cache_dir", "val": ": typing.Union[str, os.PathLike, NoneType] = None"}, {"name": "force_download", "val": ": bool = False"}, {"name": "local_files_only", "val": ": bool = False"}, {"name": "token", "val": ": typing.Union[bool, str, NoneType] = None"}, {"name": "revision", "val": ": str = 'main'"}, {"name": "**kwargs", "val": ""}]</parameters><paramsdesc>- **pretrained_model_name_or_path** (`str` or `os.PathLike`) --
  This can be either:

  - a string, the *model id* of a pretrained model configuration hosted inside a model repo on
    huggingface.co.
  - a path to a *directory* containing a configuration file saved using the
    [save_pretrained()](/docs/transformers/main/en/main_classes/configuration#transformers.PreTrainedConfig.save_pretrained) method, e.g., `./my_model_directory/`.
  - a path or url to a saved configuration JSON *file*, e.g., `./my_model_directory/configuration.json`.
- **cache_dir** (`str` or `os.PathLike`, *optional*) --
  Path to a directory in which a downloaded pretrained model configuration should be cached if the
  standard cache should not be used.
- **force_download** (`bool`, *optional*, defaults to `False`) --
  Whether or not to force to (re-)download the configuration files and override the cached versions if
  they exist.
- **proxies** (`dict[str, str]`, *optional*) --
  A dictionary of proxy servers to use by protocol or endpoint, e.g., `{'http': 'foo.bar:3128',
  'http://hostname': 'foo.bar:4012'}.` The proxies are used on each request.
- **token** (`str` or `bool`, *optional*) --
  The token to use as HTTP bearer authorization for remote files. If `True`, or not specified, will use
  the token generated when running `hf auth login` (stored in `~/.huggingface`).
- **revision** (`str`, *optional*, defaults to `"main"`) --
  The specific model version to use. It can be a branch name, a tag name, or a commit id, since we use a
  git-based system for storing models and other artifacts on huggingface.co, so `revision` can be any
  identifier allowed by git.

  <Tip>

  To test a pull request you made on the Hub, you can pass `revision="refs/pr/<pr_number>"`.

  </Tip>

- **return_unused_kwargs** (`bool`, *optional*, defaults to `False`) --
  If `False`, then this function returns just the final configuration object.

  If `True`, then this functions returns a `Tuple(config, unused_kwargs)` where *unused_kwargs* is a
  dictionary consisting of the key/value pairs whose keys are not configuration attributes: i.e., the
  part of `kwargs` which has not been used to update `config` and is otherwise ignored.
- **subfolder** (`str`, *optional*, defaults to `""`) --
  In case the relevant files are located inside a subfolder of the model repo on huggingface.co, you can
  specify the folder name here.
- **kwargs** (`dict[str, Any]`, *optional*) --
  The values in kwargs of any keys which are configuration attributes will be used to override the loaded
  values. Behavior concerning key/value pairs whose keys are *not* configuration attributes is controlled
  by the `return_unused_kwargs` keyword parameter.</paramsdesc><paramgroups>0</paramgroups><rettype>[PreTrainedConfig](/docs/transformers/main/en/main_classes/configuration#transformers.PreTrainedConfig)</rettype><retdesc>The configuration object instantiated from this pretrained model.</retdesc></docstring>

Instantiate a [PreTrainedConfig](/docs/transformers/main/en/main_classes/configuration#transformers.PreTrainedConfig) (or a derived class) from a pretrained model configuration.







<ExampleCodeBlock anchor="transformers.PreTrainedConfig.from_pretrained.example">

Examples:

```python
# We can't instantiate directly the base class *PreTrainedConfig* so let's show the examples on a
# derived class: BertConfig
config = BertConfig.from_pretrained(
    "google-bert/bert-base-uncased"
)  # Download configuration from huggingface.co and cache.
config = BertConfig.from_pretrained(
    "./test/saved_model/"
)  # E.g. config (or model) was saved using *save_pretrained('./test/saved_model/')*
config = BertConfig.from_pretrained("./test/saved_model/my_configuration.json")
config = BertConfig.from_pretrained("google-bert/bert-base-uncased", output_attentions=True, foo=False)
assert config.output_attentions == True
config, unused_kwargs = BertConfig.from_pretrained(
    "google-bert/bert-base-uncased", output_attentions=True, foo=False, return_unused_kwargs=True
)
assert config.output_attentions == True
assert unused_kwargs == {"foo": False}
```

</ExampleCodeBlock>

</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>get_config_dict</name><anchor>transformers.PreTrainedConfig.get_config_dict</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L626</source><parameters>[{"name": "pretrained_model_name_or_path", "val": ": typing.Union[str, os.PathLike]"}, {"name": "**kwargs", "val": ""}]</parameters><paramsdesc>- **pretrained_model_name_or_path** (`str` or `os.PathLike`) --
  The identifier of the pre-trained checkpoint from which we want the dictionary of parameters.</paramsdesc><paramgroups>0</paramgroups><rettype>`tuple[Dict, Dict]`</rettype><retdesc>The dictionary(ies) that will be used to instantiate the configuration object.</retdesc></docstring>

From a `pretrained_model_name_or_path`, resolve to a dictionary of parameters, to be used for instantiating a
[PreTrainedConfig](/docs/transformers/main/en/main_classes/configuration#transformers.PreTrainedConfig) using `from_dict`.








</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>get_text_config</name><anchor>transformers.PreTrainedConfig.get_text_config</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L1171</source><parameters>[{"name": "decoder", "val": " = None"}, {"name": "encoder", "val": " = None"}]</parameters><paramsdesc>- **decoder** (`Optional[bool]`, *optional*) --
  If set to `True`, then only search for decoder config names.
- **encoder** (`Optional[bool]`, *optional*) --
  If set to `True`, then only search for encoder config names.</paramsdesc><paramgroups>0</paramgroups></docstring>

Returns the text config related to the text input (encoder) or text output (decoder) of the model. The
`decoder` and `encoder` input arguments can be used to specify which end of the model we are interested in,
which is useful on models that have both text input and output modalities.

There are three possible outcomes of using this method:
1. On most models, it returns the original config instance itself.
2. On newer (2024+) composite models, it returns the text section of the config, which is nested under a set
   of valid names.
3. On older (2023-) composite models, it discards decoder-only parameters when `encoder=True` and vice-versa.




</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>register_for_auto_class</name><anchor>transformers.PreTrainedConfig.register_for_auto_class</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L1074</source><parameters>[{"name": "auto_class", "val": " = 'AutoConfig'"}]</parameters><paramsdesc>- **auto_class** (`str` or `type`, *optional*, defaults to `"AutoConfig"`) --
  The auto class to register this new configuration with.</paramsdesc><paramgroups>0</paramgroups></docstring>

Register this class with a given auto class. This should only be used for custom configurations as the ones in
the library are already mapped with `AutoConfig`.






</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>save_pretrained</name><anchor>transformers.PreTrainedConfig.save_pretrained</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L425</source><parameters>[{"name": "save_directory", "val": ": typing.Union[str, os.PathLike]"}, {"name": "push_to_hub", "val": ": bool = False"}, {"name": "**kwargs", "val": ""}]</parameters><paramsdesc>- **save_directory** (`str` or `os.PathLike`) --
  Directory where the configuration JSON file will be saved (will be created if it does not exist).
- **push_to_hub** (`bool`, *optional*, defaults to `False`) --
  Whether or not to push your model to the Hugging Face model hub after saving it. You can specify the
  repository you want to push to with `repo_id` (will default to the name of `save_directory` in your
  namespace).
- **kwargs** (`dict[str, Any]`, *optional*) --
  Additional key word arguments passed along to the [push_to_hub()](/docs/transformers/main/en/main_classes/model#transformers.utils.PushToHubMixin.push_to_hub) method.</paramsdesc><paramgroups>0</paramgroups></docstring>

Save a configuration object to the directory `save_directory`, so that it can be re-loaded using the
[from_pretrained()](/docs/transformers/main/en/main_classes/configuration#transformers.PreTrainedConfig.from_pretrained) class method.




</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>to_dict</name><anchor>transformers.PreTrainedConfig.to_dict</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L916</source><parameters>[]</parameters><rettype>`dict[str, Any]`</rettype><retdesc>Dictionary of all the attributes that make up this configuration instance.</retdesc></docstring>

Serializes this instance to a Python dictionary.






</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>to_diff_dict</name><anchor>transformers.PreTrainedConfig.to_diff_dict</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L857</source><parameters>[]</parameters><rettype>dict[str, Any]</rettype><retdesc>Dictionary of all the attributes that make up this configuration instance.</retdesc></docstring>

Removes all attributes from the configuration that correspond to the default config attributes for
better readability, while always retaining the `config` attribute from the class. Serializes to a
Python dictionary.






</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>to_json_file</name><anchor>transformers.PreTrainedConfig.to_json_file</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L968</source><parameters>[{"name": "json_file_path", "val": ": typing.Union[str, os.PathLike]"}, {"name": "use_diff", "val": ": bool = True"}]</parameters><paramsdesc>- **json_file_path** (`str` or `os.PathLike`) --
  Path to the JSON file in which this configuration instance's parameters will be saved.
- **use_diff** (`bool`, *optional*, defaults to `True`) --
  If set to `True`, only the difference between the config instance and the default `PreTrainedConfig()`
  is serialized to JSON file.</paramsdesc><paramgroups>0</paramgroups></docstring>

Save this instance to a JSON file.




</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>to_json_string</name><anchor>transformers.PreTrainedConfig.to_json_string</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L950</source><parameters>[{"name": "use_diff", "val": ": bool = True"}]</parameters><paramsdesc>- **use_diff** (`bool`, *optional*, defaults to `True`) --
  If set to `True`, only the difference between the config instance and the default `PreTrainedConfig()`
  is serialized to JSON string.</paramsdesc><paramgroups>0</paramgroups><rettype>`str`</rettype><retdesc>String containing all the attributes that make up this configuration instance in JSON format.</retdesc></docstring>

Serializes this instance to a JSON string.








</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>update</name><anchor>transformers.PreTrainedConfig.update</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L982</source><parameters>[{"name": "config_dict", "val": ": dict"}]</parameters><paramsdesc>- **config_dict** (`dict[str, Any]`) -- Dictionary of attributes that should be updated for this class.</paramsdesc><paramgroups>0</paramgroups></docstring>

Updates attributes of this class with attributes from `config_dict`.




</div>
<div class="docstring border-l-2 border-t-2 pl-4 pt-3.5 border-gray-100 rounded-tl-xl mb-6 mt-8">


<docstring><name>update_from_string</name><anchor>transformers.PreTrainedConfig.update_from_string</anchor><source>https://github.com/huggingface/transformers/blob/main/src/transformers/configuration_utils.py#L992</source><parameters>[{"name": "update_str", "val": ": str"}]</parameters><paramsdesc>- **update_str** (`str`) -- String with attributes that should be updated for this class.</paramsdesc><paramgroups>0</paramgroups></docstring>

Updates attributes of this class with attributes from `update_str`.

The expected format is ints, floats and strings as is, and for booleans use `true` or `false`. For example:
"n_embd=10,resid_pdrop=0.2,scale_attn_weights=false,summary_type=cls_index"

The keys to change have to already exist in the config object.




</div></div>

<EditOnGithub source="https://github.com/huggingface/transformers/blob/main/docs/source/en/main_classes/configuration.md" />
