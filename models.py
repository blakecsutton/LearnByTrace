from django.db import models

# This represents an algorithm, as opposed to an ExecutionTrace. 
# Thus an algorithm can have multiple execution traces.
class Algorithm(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    
    # File that holds the pseudo-code text for display and correlation with the execution trace.
    pseudo_code = models.FileField(upload_to='learnbytrace/files')
    
    def __unicode__(self):
        return self.title
    
class ExecutionTrace(models.Model):
    
    # Foreign key to the algorithm this trace is for. Just allows multiple datasets (and thus, distinct traces)
    # for the same pseudocode.
    algorithm = models.ForeignKey(Algorithm, null=True, blank=True, default=None)
    
    title = models.CharField(max_length=100) 
    notes = models.TextField()
    
    # File that holds the execution trace markup
    trace = models.FileField(upload_to='learnbytrace/files')
    
    # Optional image which visualizes the dataset (it should also be written in the trace file).
    image = models.ImageField(blank=True, upload_to='learnbytrace/files') 
    
    def __unicode__(self):
        return self.title