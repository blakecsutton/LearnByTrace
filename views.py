# Create your views here.
from django.shortcuts import render_to_response, redirect
from django.template.context import RequestContext
from django.db.models.aggregates import Max
from models import ExecutionTrace, Algorithm
import os.path
import re;

def algorithm_list(request):
  """ This is a view for the main page, which lists the algorithms in the system along with some
      information about them like how many traces there are per algorithm and so on. """
      
  trace_list = ExecutionTrace.objects.order_by('algorithm')
  
  statistics = {}
  statistics['total_algorithms'] = Algorithm.objects.count()
  statistics['total_traces'] = ExecutionTrace.objects.count()
  
  ratio = round(statistics['total_traces'] / float(statistics['total_algorithms']), 2)
  statistics['traces_per_algorithm'] = ratio
  
  latest_trace_id = ExecutionTrace.objects.aggregate(Max('id'))['id__max']
  statistics['most_recent_trace'] = ExecutionTrace.objects.get(pk=latest_trace_id)
  
  context = {'object_list': trace_list,
             'statistics': statistics}
  
  return render_to_response('learnbytrace/executiontrace_list.html', 
                            context_instance=RequestContext(request, context))
  
    
def executiontrace_detail(request, trace_id):
    """ This is a view which shows the interactive trace of an algorithm. It loads the pseudo-code file
        of the parent algorithm and adds line numbers for display in the template.
        It passes on the stored paths of the dataset image (if available) and the trace file markup,
        which is processed and displayed via javascript.
        
        TODO: start caching the markup generated by the javascript, and hit the cache first to see if the
              JS needs to process a new markup file.
    """
    
    # Get the list of cards, return the deck listing page if deck doesn't exist.
    try:
        trace = ExecutionTrace.objects.get(pk=trace_id)
    except ExecutionTrace.DoesNotExist:
        return redirect('/learnbytrace/')
    
    # Open pseudocode file, it's a File model field
    code_file = trace.algorithm.pseudo_code
    
    # Read file line by line and put in a dictionary indexed by line (used for javascript -- needed?)
    # Also save the full text as a long string for display.    
    line_number = 1
    pseudocode_dict = {}
    regex_spaces = re.compile('\s')
    for line in code_file:
        # Replace whitespace with non-breaking spaces to preserve the white space indentation.
        pseudocode_dict[line_number] = re.sub(regex_spaces, '&nbsp;', line)
        line_number += 1

    # Get the path to the trace tree, for displaying and parsing in the template.
    trace_tree = trace.trace.path
    
    if trace.image:
        image_url = trace.image.url
        
    related_traces = ExecutionTrace.objects.filter(algorithm=trace.algorithm).exclude(id=trace.id).values('id', 'title')

    context = {'trace': trace,
               'pseudocode_dict': pseudocode_dict,
                'trace_tree': trace_tree,
                'image_url': image_url,
                'related_traces': related_traces}
    
    return render_to_response('learnbytrace/view_trace.html', 
                              context_instance=RequestContext(request, context))
    